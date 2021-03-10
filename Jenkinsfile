pipeline {
  agent {
    docker {
      image 'vasdvp/lighthouse-node-application-base:node12'
    }
  }
  environment {
    NPM_CONFIG_REGISTRY = 'https://tools.health.dev-developer.va.gov/nexus/repository/lighthouse-npm-registry-proxy/'
  }

  stages {
    stage('Setup') {
      steps {
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
        sh 'npm run test'
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
            usernameVariable: 'GITHUB_USERNAME'
            passwordVariable: 'GITHUB_TOKEN'), 
          string(
            credentialsId: 'LIGHTHOUSE_NPM_REGISTRY_PROXY_NEXUS_TOKEN',
            variable: 'NPM_TOKEN')
        ]) {
          sh 'npm run release'
        }
      }
    }
  }
}
