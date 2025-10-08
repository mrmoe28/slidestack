#!/usr/bin/env node

/**
 * Vercel Deployment Monitor
 * Monitors Vercel deployments and reports status
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const POLL_INTERVAL = 10000 // 10 seconds
const MAX_RETRIES = 30 // 5 minutes total

async function getLatestDeployment() {
  try {
    const { stdout } = await execAsync('vercel ls --json | head -1')
    const deployment = JSON.parse(stdout)
    return deployment
  } catch (error) {
    console.error('❌ Failed to get deployment:', error.message)
    return null
  }
}

async function getDeploymentStatus(deploymentUrl) {
  try {
    const { stdout } = await execAsync(`vercel inspect ${deploymentUrl} --json`)
    const status = JSON.parse(stdout)
    return status
  } catch (error) {
    console.error('❌ Failed to get deployment status:', error.message)
    return null
  }
}

async function checkDeploymentLogs(deploymentUrl) {
  try {
    const { stdout } = await execAsync(`vercel logs ${deploymentUrl} --output=raw`)
    return stdout
  } catch (error) {
    console.error('❌ Failed to get logs:', error.message)
    return ''
  }
}

async function monitorDeployment() {
  console.log('🔍 Starting Vercel deployment monitor...\n')

  let retries = 0

  while (retries < MAX_RETRIES) {
    const deployment = await getLatestDeployment()

    if (!deployment) {
      console.log('⏳ Waiting for deployment...')
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
      retries++
      continue
    }

    console.log(`📦 Deployment: ${deployment.url}`)
    console.log(`📊 State: ${deployment.state}`)
    console.log(`🕐 Created: ${new Date(deployment.created).toLocaleString()}\n`)

    if (deployment.state === 'READY') {
      console.log('✅ Deployment successful!')
      console.log(`🌐 Live at: https://${deployment.url}\n`)
      return { success: true, url: deployment.url }
    }

    if (deployment.state === 'ERROR') {
      console.log('❌ Deployment failed!')
      const logs = await checkDeploymentLogs(deployment.url)

      // Extract error information
      const errorMatch = logs.match(/Error: (.+)/gi)
      if (errorMatch) {
        console.log('\n📋 Errors found:')
        errorMatch.slice(0, 5).forEach(err => console.log(`  - ${err}`))
      }

      return {
        success: false,
        url: deployment.url,
        errors: errorMatch || [],
        logs
      }
    }

    if (deployment.state === 'BUILDING' || deployment.state === 'QUEUED') {
      console.log('⏳ Building...')
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
      retries++
      continue
    }

    console.log(`ℹ️  Unknown state: ${deployment.state}`)
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
    retries++
  }

  console.log('⏱️  Timeout reached')
  return { success: false, timeout: true }
}

// Run monitor
monitorDeployment()
  .then(result => {
    if (result.success) {
      process.exit(0)
    } else {
      console.log('\n⚠️  Deployment issues detected')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Monitor error:', error)
    process.exit(1)
  })
