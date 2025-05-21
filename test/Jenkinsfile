pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'
    }
    
    stages {
        stage('Build') {
            steps {
                echo 'Building application...'
                sh 'npm install'
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'npm test'
            }
        }
        
        stage('Code Quality') {
            steps {
                echo 'Code quality analysis placeholder'
                // SonarQube integration will be added here
            }
        }
        
        stage('Security') {
            steps {
                echo 'Security scan placeholder'
                // Security scanning will be added here
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Deployment placeholder'
                // Deployment to test environment will be added here
            }
        }
        
        stage('Release') {
            steps {
                echo 'Release placeholder'
                // Release management will be added here
            }
        }
        
        stage('Monitoring') {
            steps {
                echo 'Monitoring placeholder'
                // Monitoring setup will be added here
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed'
        }
        success {
            echo 'Pipeline succeeded'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}