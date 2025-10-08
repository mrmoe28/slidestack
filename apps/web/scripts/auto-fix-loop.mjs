#!/usr/bin/env node

/**
 * Auto-Fix Build Errors Loop
 * Continuously monitors build, reports errors, and waits for fixes
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { readFileSync } from 'fs'

const execAsync = promisify(exec)

const MAX_ITERATIONS = 10
const CHECK_INTERVAL = 5000 // 5 seconds

async function runBuild() {
  console.log('🔨 Running build...\n')
  try {
    const { stdout, stderr } = await execAsync('pnpm build', {
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    })

    console.log(stdout)
    if (stderr) console.error(stderr)

    return { success: true, output: stdout }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || '',
      errorOutput: error.stderr || ''
    }
  }
}

async function runLint() {
  console.log('🔍 Running ESLint...\n')
  try {
    const { stdout } = await execAsync('pnpm lint')
    console.log(stdout)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error.stdout || error.stderr || error.message
    }
  }
}

function extractErrors(output) {
  const errors = []

  // Extract TypeScript errors
  const tsErrors = output.match(/Type error:.+/gi) || []
  errors.push(...tsErrors)

  // Extract build errors
  const buildErrors = output.match(/Error:.+/gi) || []
  errors.push(...buildErrors)

  // Extract line numbers and file paths
  const fileErrors = output.match(/\.\/[^\s]+:\d+:\d+/gi) || []
  errors.push(...fileErrors)

  return [...new Set(errors)] // Remove duplicates
}

async function autoFixLoop() {
  console.log('🤖 Auto-Fix Loop Started\n')
  console.log('This will monitor builds and report errors for fixing.\n')
  console.log('=' + '='.repeat(60) + '\n')

  let iteration = 0
  let lastErrors = []

  while (iteration < MAX_ITERATIONS) {
    iteration++
    console.log(`\n📍 Iteration ${iteration}/${MAX_ITERATIONS}`)
    console.log('─'.repeat(60))

    // Run lint check
    const lintResult = await runLint()
    if (!lintResult.success) {
      console.log('\n❌ ESLint errors found:')
      console.log(lintResult.error)
      console.log('\n⏳ Waiting for fixes...')
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL))
      continue
    }

    console.log('✅ ESLint passed')

    // Run build
    const buildResult = await runBuild()

    if (buildResult.success) {
      console.log('\n✅ Build successful!')
      console.log('\n🎉 All checks passed! Ready to deploy.')
      return { success: true }
    }

    // Extract and display errors
    const errors = extractErrors(buildResult.errorOutput + buildResult.output)

    if (errors.length === 0) {
      console.log('\n⚠️  Build failed but no specific errors found')
      console.log(buildResult.errorOutput || buildResult.output)
    } else {
      console.log('\n❌ Build errors found:')
      errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`)
      })
    }

    // Check if errors changed
    const errorsChanged = JSON.stringify(errors.sort()) !== JSON.stringify(lastErrors.sort())

    if (errorsChanged) {
      console.log('\n🔄 New errors detected!')
      lastErrors = errors
    } else {
      console.log('\n⏸️  Same errors as before')
    }

    console.log('\n⏳ Waiting for fixes...')
    console.log('   (The loop will auto-check in 5 seconds)')

    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL))
  }

  console.log('\n⚠️  Max iterations reached')
  return { success: false, maxIterations: true }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Auto-fix loop stopped by user')
  process.exit(0)
})

// Run the loop
autoFixLoop()
  .then(result => {
    if (result.success) {
      console.log('\n✨ All issues resolved!')
      process.exit(0)
    } else {
      console.log('\n⚠️  Issues remain - manual intervention may be needed')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n❌ Auto-fix error:', error)
    process.exit(1)
  })
