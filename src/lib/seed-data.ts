import connectDB from './mongodb';
import Company from '@/models/Company';

/**
 * Seed the database with one brand and sample keywords
 */
export async function seedDatabase() {
  try {
    await connectDB();
    
    // Check if we already have data
    const existingCompany = await Company.findOne();
    if (existingCompany) {
      console.log('✅ Database already seeded');
      return;
    }

    // Create a sample brand with keywords as specified in PRD
    const sampleBrand = new Company({
      name: 'TechCorp',
      website: 'https://techcorp.example.com',
      title: 'TechCorp - Innovative Technology Solutions',
      description: 'Leading technology company specializing in AI and cloud solutions',
      keywords: [
        {
          id: '1',
          name: 'TechCorp',
          type: 'Own Brand',
          mentions: 'medium',
          color: '#3B82F6'
        },
        {
          id: '2',
          name: 'techcorp',
          type: 'Own Brand',
          mentions: 'medium',
          color: '#3B82F6'
        },
        {
          id: '3',
          name: 'TechCorp AI',
          type: 'Own Brand',
          mentions: 'low',
          color: '#3B82F6'
        },
        {
          id: '4',
          name: 'InnovateTech',
          type: 'Competitor',
          mentions: 'high',
          color: '#EF4444'
        },
        {
          id: '5',
          name: 'CloudTech',
          type: 'Competitor',
          mentions: 'medium',
          color: '#EF4444'
        },
        {
          id: '6',
          name: 'artificial intelligence',
          type: 'Industry',
          mentions: 'high',
          color: '#10B981'
        },
        {
          id: '7',
          name: 'AI',
          type: 'Industry',
          mentions: 'high',
          color: '#10B981'
        },
        {
          id: '8',
          name: 'cloud computing',
          type: 'Industry',
          mentions: 'medium',
          color: '#10B981'
        }
      ],
      onboardingComplete: true
    });

    await sampleBrand.save();
    console.log('✅ Sample brand created:', sampleBrand.name);
    console.log('✅ Database seeded with one brand and sample keywords');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
} 