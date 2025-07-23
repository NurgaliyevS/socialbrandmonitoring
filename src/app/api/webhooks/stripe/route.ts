import Stripe from "stripe";
import User, { IUser, IStripeSubscription, IStripeOneTimePayment } from "@/models/User";
import connectDB from "@/lib/mongodb";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  throw new Error("Stripe environment variables are not set");
}
const stripe = new Stripe(STRIPE_SECRET_KEY);
const webhookSecret = STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request): Promise<Response> {
  await connectDB();

  const buf = Buffer.from(await request.arrayBuffer());
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // --- SUBSCRIPTION EVENTS ---
  if (event.type === "checkout.session.completed") {
    // Handles both subscriptions and one-time payments
    const session = event.data.object as Stripe.Checkout.Session;
    const customerIdRaw = session.customer;
    const customerId = typeof customerIdRaw === 'string' ? customerIdRaw : null;
    const email = session.customer_details?.email || session.customer_email;
    const isSubscription = !!session.subscription;

    // Only update user if a valid customerId or email is present
    let user: IUser | null = null;
    if (customerId) {
      user = await User.findOne({ stripeCustomerId: customerId });
    } else if (email) {
      user = await User.findOne({ email });
    }
    if (!user) {
      // create new user
      user = new User({
        name: session.customer_details?.name || '',
        email: email || '',
        stripeCustomerId: customerId || '',
        plan: "paid",
      });
      await user?.save();
    }

    if (isSubscription && customerId) {
      // SUBSCRIPTION: Add or update subscription in user's subscriptions array
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as Stripe.Subscription;
      const newSub: IStripeSubscription = {
        id: subscription.id,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        status: subscription.status as IStripeSubscription["status"],
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        planId: subscription.items.data[0].plan.id,
        planName: subscription.items.data[0].plan.nickname || subscription.items.data[0].plan.id,
        amount: subscription.items.data[0].plan.amount || 0,
        currency: subscription.items.data[0].plan.currency,
        interval: subscription.items.data[0].plan.interval as "month" | "year",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // Upsert subscription (replace if exists, else push)
      await User.updateOne(
        { _id: user?._id, "subscriptions.stripeSubscriptionId": subscription.id },
        { $set: { "subscriptions.$": newSub, plan: "paid", stripeCustomerId: customerId } }
      );
      // If not found, push as new
      await User.updateOne(
        { _id: user?._id, "subscriptions.stripeSubscriptionId": { $ne: subscription.id } },
        { $push: { subscriptions: newSub }, $set: { plan: "paid", stripeCustomerId: customerId } }
      );
    } else if (!isSubscription) {
      // ONE-TIME: Add new one-time payment
      const paymentIntentId = session.payment_intent as string;
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId) as Stripe.PaymentIntent;
      const newPayment: IStripeOneTimePayment = {
        id: paymentIntent.id,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: customerId || '',
        amount: paymentIntent.amount_received,
        currency: paymentIntent.currency,
        status: paymentIntent.status as IStripeOneTimePayment["status"],
        description: paymentIntent.description || "",
        metadata: paymentIntent.metadata,
        createdAt: new Date(),
      };
      await User.findByIdAndUpdate(user?._id, {
        $push: { oneTimePayments: newPayment },
        ...(customerId ? { $set: { stripeCustomerId: customerId, plan: "paid" } } : {}),
      });
    }
  }

  if (event.type === "customer.subscription.updated") {
    // SUBSCRIPTION: Update subscription info and plan
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    const user: IUser | null = await User.findOne({ stripeCustomerId: customerId });
    if (!user) return new Response("User not found", { status: 404 });
    await User.updateOne(
      { _id: user._id, "subscriptions.stripeSubscriptionId": subscription.id },
      {
        $set: {
          "subscriptions.$.status": subscription.status,
          "subscriptions.$.currentPeriodStart": new Date((subscription as any).current_period_start * 1000),
          "subscriptions.$.currentPeriodEnd": new Date((subscription as any).current_period_end * 1000),
          "subscriptions.$.cancelAtPeriodEnd": subscription.cancel_at_period_end,
          "subscriptions.$.updatedAt": new Date(),
          plan: subscription.status === "active" ? "paid" : "free",
        },
      }
    );
  }

  if (event.type === "customer.subscription.deleted") {
    // SUBSCRIPTION: Mark subscription as cancelled and set plan to free
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    const user: IUser | null = await User.findOne({ stripeCustomerId: customerId });
    if (!user) return new Response("User not found", { status: 404 });
    await User.updateOne(
      { _id: user._id, "subscriptions.stripeSubscriptionId": subscription.id },
      {
        $set: {
          "subscriptions.$.status": subscription.status,
          "subscriptions.$.currentPeriodStart": new Date((subscription as any).current_period_start * 1000),
          "subscriptions.$.currentPeriodEnd": new Date((subscription as any).current_period_end * 1000),
          "subscriptions.$.cancelAtPeriodEnd": subscription.cancel_at_period_end,
          "subscriptions.$.updatedAt": new Date(),
          plan: "free",
        },
      }
    );
  }

  if (event.type === "invoice.payment_succeeded") {
    // SUBSCRIPTION: Payment succeeded, update plan to paid
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = (invoice as any).subscription as string;
    const customerId = invoice.customer as string;
    const user: IUser | null = await User.findOne({ stripeCustomerId: customerId });
    if (!user) return new Response("User not found", { status: 404 });
    await User.updateOne(
      { _id: user._id, "subscriptions.stripeSubscriptionId": subscriptionId },
      {
        $set: {
          plan: "paid",
          "subscriptions.$.updatedAt": new Date(),
        },
      }
    );
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
