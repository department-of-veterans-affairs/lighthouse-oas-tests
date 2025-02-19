pipeline {
  agent {
    docker {
      image 'ghcr.io/department-of-veterans-affairs/health-apis-docker-octopus/lighthouse-node-application-base:v2-node18'
      registryUrl 'https://ghcr.io'
      registryCredentialsId 'GITHUB_USERNAME_TOKEN'
    }
  }
  environment {
    NPM_TOKEN = credentials('LIGHTHOUSE_NPM_REGISTRY_TOKEN')
    NPM_CONFIG_CACHE = '/tmp/.npm' // Set a custom cache directory
    HOME = '/tmp' // Set HOME to a writable directory

  }

  stages {
    stage('Setup') {
      steps {
        // Clean up node_modules and npm cache
        sh 'rm -rf node_modules'
        sh 'npm cache clean --force'
        // Change ownership of the npm cache directory
        sh 'sudo chown -R $(id -u):$(id -g) $NPM_CONFIG_CACHE || true'
        sh 'npm install'
      }
    }
    stage('Lint') {
      steps{
        sh 'npm run lint'
      }
    }
    stage('Test') {
      steps {
        sh 'npm run test:ci'
      }
    }
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
    stage('Release') {
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: 'GITHUB_USERNAME_TOKEN',
            usernameVariable: 'GITHUB_USERNAME',
            passwordVariable: 'GITHUB_TOKEN')
        ]) {
          sh 'npm run release'
        }
      }
    }
  }
}
