pipeline {
  agent {
    docker {
      image 'vasdvp/lighthouse-node-application-base:node12'
    }
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
  }
}
