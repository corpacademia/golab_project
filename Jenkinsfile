pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        S3_BUCKET = 'golabing'
        BUILD_DIR = 'dist'
    }

    options {
        timestamps()
    }

    tools {
        nodejs 'node18' // Make sure this is configured in Jenkins → Global Tool Configuration
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Deploy to S3') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: '9df79d1f-0539-4d32-9b7d-02ed68426fb9' // Use your AWS credentials ID here
                ]]) {
                    sh '''
                        aws s3 sync ${BUILD_DIR}/ s3://${S3_BUCKET}/ --delete
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Build or deployment failed.'
        }
    }
}
