pipeline {
  agent {
    docker {
      image 'ghcr.io/department-of-veterans-affairs/health-apis-docker-octopus/lighthouse-node-application-base:v2-node18'
      registryUrl 'https://ghcr.io'
      registryCredentialsId 'GITHUB_USERNAME_TOKEN'
      args '-w $HOME/lhuser'
    }
  }
  environment {
    NPM_TOKEN = credentials('LIGHTHOUSE_NPM_REGISTRY_TOKEN')
  }

  stages {
    stage('Setup') {
      steps {
        sh 'ls -l'
        sh 'pwd'
        sh 'npm ci'
      }
    }
    stage('Lint') {
      steps {
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
