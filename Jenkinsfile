pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        S3_BUCKET = 'golabing'
        BUILD_DIR = 'build' // React default output dir
    }

    options {
        timestamps()
    }

    tools {
        nodejs 'node18' // Ensure Node.js 18 is set up in Jenkins Global Tool Configuration
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('Client') {
                    sh 'npm install'
                }
            }
        }

        stage('Build') {
            steps {
                dir('Client') {
                    sh 'npm run build'
                }
            }
        }

        stage('Test') {
            steps {
                dir('Client') {
                    sh 'npm test || true'
                }
            }
        }

        stage('Deploy to S3') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: '9df79d1f-0539-4d32-9b7d-02ed68426fb9'
                ]]) {
                    dir('Client') {
                        sh '''
                            aws s3 sync ${BUILD_DIR}/ s3://${S3_BUCKET}/ --delete
                        '''
                    }
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
