import connectDB from './mongodb';
import Mention from '../models/Mention';

/**
 * Simple mention cleanup service
 * Deletes mentions older than specified days
 */
export async function cleanupOldMentions(daysToKeep: number = 30, dryRun: boolean = false) {
  try {
    await connectDB();
    
    // Calculate cutoff date
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    console.log(`🧹 Starting mention cleanup - removing mentions older than ${daysToKeep} days`);
    console.log(`📅 Cutoff date: ${cutoffDate.toISOString()}`);
    
    // Count mentions to be deleted
    const countToDelete = await Mention.countDocuments({
      created: { $lt: cutoffDate }
    });
    
    console.log(`📊 Found ${countToDelete} mentions to delete`);
    
    if (countToDelete === 0) {
      console.log('✅ No old mentions found, cleanup complete');
      return { deleted: 0, message: 'No old mentions found' };
    }
    
    if (dryRun) {
      console.log(`🔍 DRY RUN - Would delete ${countToDelete} mentions`);
      return { 
        deleted: countToDelete, 
        message: `Dry run: Would delete ${countToDelete} mentions older than ${daysToKeep} days` 
      };
    }
    
    // Delete old mentions
    const result = await Mention.deleteMany({
      created: { $lt: cutoffDate }
    });
    
    console.log(`✅ Cleanup complete - deleted ${result.deletedCount} mentions`);
    
    return {
      deleted: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} mentions older than ${daysToKeep} days`
    };
    
  } catch (error) {
    console.error('❌ Error during mention cleanup:', error);
    throw error;
  }
}

/**
 * Get mention statistics for monitoring
 */
export async function getMentionStats() {
  try {
    await connectDB();
    
    const totalMentions = await Mention.countDocuments();
    const oldestMention = await Mention.findOne({}, { created: 1 }).sort({ created: 1 });
    const newestMention = await Mention.findOne({}, { created: 1 }).sort({ created: -1 });
    
    return {
      totalMentions,
      oldestMention: oldestMention?.created,
      newestMention: newestMention?.created
    };
  } catch (error) {
    console.error('❌ Error getting mention stats:', error);
    throw error;
  }
}
