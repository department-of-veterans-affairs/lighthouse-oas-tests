pipeline {
  agent {
    docker {
      image 'node:14-alpine'
    }
  }

  stages {
    stage('Setup') {
      steps {
        sh 'npm config ls -l | grep config'
        sh 'npm install --cache empty-cache'
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
  }
}