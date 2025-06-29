import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data migration...');

  // Read the orientations data
  const dataPath = path.join(process.cwd(), 'src', 'data', 'orientations.json');
  const orientationsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  console.log(`Found ${orientationsData.length} orientations to migrate`);

  // Group by hub and university
  const hubsData = {};
  const universitiesData = {};

  for (const item of orientationsData) {
    // Process hub
    if (!hubsData[item.hub]) {
      hubsData[item.hub] = {
        name: item.hub,
        universities: new Set()
      };
    }
    hubsData[item.hub].universities.add(item.university);

    // Process university
    const universityKey = `${item.hub}:${item.university}`;
    if (!universitiesData[universityKey]) {
      universitiesData[universityKey] = {
        name: item.university,
        hubName: item.hub,
        orientations: []
      };
    }
    universitiesData[universityKey].orientations.push(item);
  }

  // Create hubs
  console.log('Creating hubs...');
  const createdHubs = {};
  for (const [hubName, hubData] of Object.entries(hubsData)) {
    const hub = await prisma.hub.upsert({
      where: { name: hubName },
      update: {},
      create: {
        name: hubName
      }
    });
    createdHubs[hubName] = hub;
    console.log(`Created/found hub: ${hubName}`);
  }

  // Create universities
  console.log('Creating universities...');
  const createdUniversities = {};
  for (const [universityKey, universityData] of Object.entries(universitiesData)) {
    const hub = createdHubs[universityData.hubName];
    const university = await prisma.university.upsert({
      where: { 
        id: `${hub.id}_${universityData.name}` 
      },
      update: {},
      create: {
        name: universityData.name,
        hubId: hub.id
      }
    });
    createdUniversities[universityKey] = university;
    console.log(`Created/found university: ${universityData.name}`);
  }

  // Create orientations and bac scores
  console.log('Creating orientations and bac scores...');
  for (const [universityKey, universityData] of Object.entries(universitiesData)) {
    const university = createdUniversities[universityKey];
    
    for (const orientationItem of universityData.orientations) {
      // Create orientation
      const orientation = await prisma.orientation.upsert({
        where: { code: orientationItem.code },
        update: {
          licence: orientationItem.licence,
          universityId: university.id
        },
        create: {
          code: orientationItem.code,
          licence: orientationItem.licence,
          universityId: university.id
        }
      });

      console.log(`Created/found orientation: ${orientationItem.licence} (${orientationItem.code})`);

      // Create bac scores
      for (const bacScore of orientationItem.bacScores) {
        await prisma.bacScore.upsert({
          where: {
            orientationId_bacType: {
              orientationId: orientation.id,
              bacType: bacScore.bacType
            }
          },
          update: {
            score2024: bacScore.score2024,
            score2023: bacScore.score2023,
            score2022: bacScore.score2022
          },
          create: {
            orientationId: orientation.id,
            bacType: bacScore.bacType,
            score2024: bacScore.score2024,
            score2023: bacScore.score2023,
            score2022: bacScore.score2022
          }
        });
      }

      console.log(`Created bac scores for ${orientationItem.licence}`);
    }
  }

  console.log('Data migration completed successfully!');

  // Print summary
  const hubCount = await prisma.hub.count();
  const universityCount = await prisma.university.count();
  const orientationCount = await prisma.orientation.count();
  const bacScoreCount = await prisma.bacScore.count();

  console.log('\n=== MIGRATION SUMMARY ===');
  console.log(`Hubs created: ${hubCount}`);
  console.log(`Universities created: ${universityCount}`);
  console.log(`Orientations created: ${orientationCount}`);
  console.log(`Bac scores created: ${bacScoreCount}`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
