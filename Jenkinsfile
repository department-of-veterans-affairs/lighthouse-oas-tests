pipeline {
  agent {
    docker {
      image 'vasdvp/lighthouse-node-application-base:node14'
    }
  }
  environment {}

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
