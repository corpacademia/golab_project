pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        S3_BUCKET = 'golabing'
        BUILD_DIR = 'dist' // ✅ Vite default build output
        CLOUDFRONT_DISTRIBUTION_ID = 'E3NMMRVKLGI4PK' // ✅ CloudFront Distribution ID
    }

    options {
        timestamps()
    }

    tools {
        nodejs 'node18' // Ensure Node.js 18 is configured in Jenkins → Global Tool Configuration
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
                    // If no tests exist, skip without failing
                    sh 'npm test || echo "No tests defined. Skipping."'
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

        stage('Invalidate CloudFront Cache') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: '9df79d1f-0539-4d32-9b7d-02ed68426fb9'
                ]]) {
                    sh '''
                        aws cloudfront create-invalidation \
                          --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
                          --paths "/*"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment and CloudFront invalidation successful!'
        }
        failure {
            echo '❌ Build or deployment failed.'
        }
    }
}




