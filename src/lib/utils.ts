import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Mention from "@/models/Mention";
import connectDB from "@/lib/mongodb";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check for duplicate mentions in the database
 * Useful for debugging and verifying duplicate prevention
 */
export async function checkForDuplicateMentions() {
  try {
    await connectDB();
    
    const duplicates = await Mention.aggregate([
      {
        $group: {
          _id: { platform: '$platform', itemId: '$itemId' },
          count: { $sum: 1 },
          mentions: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate mentions found in database');
      return { hasDuplicates: false, duplicates: [] };
    }

    console.log(`⚠️ Found ${duplicates.length} groups with duplicate mentions:`);
    duplicates.forEach(group => {
      const { platform, itemId } = group._id;
      console.log(`  - ${platform}/${itemId}: ${group.count} mentions`);
    });

    return { hasDuplicates: true, duplicates };
  } catch (error) {
    console.error('❌ Error checking for duplicates:', error);
    throw error;
  }
}
