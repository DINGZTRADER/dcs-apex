import { PrismaClient } from '@prisma/client'
import { prisma } from '../src/lib/prisma'
import { readFileSync } from 'fs'
import path from 'path'
import { cwd } from 'process'

/**
 * Robust Seeding Script for DCS Apex
 * 
 * Instructions:
 * 1. Ensure 'dummy/dataset2.json' exists.
 * 2. Run: npx prisma db seed
 */

async function main() {
  console.log('🌱 Starting database seed...')

  // Path to your provided JSON file
  const seedFilePath = path.join(cwd(), 'dummy', 'dataset2.json')

  try {
    const fileContent = readFileSync(seedFilePath, 'utf-8')
    const seedData = JSON.parse(fileContent)

    console.log(`📂 Found ${seedData.length} items to seed from ${seedFilePath}`)

    for (const item of seedData) {
      try {
        if (item.model === 'User') {
          await prisma.user.upsert({
            where: { email: item.data.email },
            update: {}, // Don't overwrite existing users
            create: {
              email: item.data.email,
              password: item.data.password,
              role: item.data.role,
              isActive: item.data.isActive
            }
          })
        }
        else if (item.model === 'Student') {
          await prisma.student.upsert({
            where: { studentNo: item.data.studentNo },
            update: {},
            create: {
              studentNo: item.data.studentNo,
              fullName: item.data.fullName,
              program: item.data.program,
              year: item.data.year,
              status: item.data.status
            }
          })
        }
        // Add other models here if present in dataset2.json

      } catch (recordError) {
        console.warn(`⚠️ Failed to seed ${item.model} (${JSON.stringify(item.data).slice(0, 50)}...):`, recordError)
      }
    }

    console.log('✅ Seeding completed.')

  } catch (err) {
    console.error('❌ Critical Error reading seed file:', err)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
