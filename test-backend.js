#!/usr/bin/env node

// Shea Blog 后端服务测试脚本
// 用于验证API接口和SMTP配置是否正常工作

const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// 测试函数
async function testEndpoint(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: endpoint,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        data: result
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data && method === 'POST') {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// 运行测试
async function runTests() {
    console.log('🚀 开始测试 Shea Blog 后端服务...\n');

    try {
        // 测试健康检查接口
        console.log('1. 测试健康检查接口 /health');
        const healthResult = await testEndpoint('/health');
        console.log(`   状态码: ${healthResult.status}`);
        console.log(`   响应: ${JSON.stringify(healthResult.data)}\n`);

        // 测试SMTP连接接口
        console.log('2. 测试SMTP连接接口 /test-smtp');
        const smtpResult = await testEndpoint('/test-smtp');
        console.log(`   状态码: ${smtpResult.status}`);
        console.log(`   响应: ${JSON.stringify(smtpResult.data)}\n`);

        // 测试联系表单接口（模拟数据）
        console.log('3. 测试联系表单接口 /contact');
        const contactData = {
            name: '测试用户',
            email: 'test@example.com',
            subject: '测试消息',
            message: '这是一条测试消息，用于验证后端服务是否正常工作。'
        };
        
        const contactResult = await testEndpoint('/contact', 'POST', contactData);
        console.log(`   状态码: ${contactResult.status}`);
        console.log(`   响应: ${JSON.stringify(contactResult.data)}\n`);

        console.log('✅ 所有测试完成！');
        console.log('\n📋 部署检查清单:');
        console.log('   - 确保 .env 文件已配置SMTP信息');
        console.log('   - 运行 docker-compose up -d 启动服务');
        console.log('   - 访问 http://localhost:3000 验证网站');
        console.log('   - 测试联系表单功能是否正常工作');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.log('\n🔧 故障排除建议:');
        console.log('   - 检查后端服务是否正在运行');
        console.log('   - 验证端口 3000 是否被占用');
        console.log('   - 确认 .env 文件配置正确');
    }
}

// 检查服务是否运行
async function checkServiceRunning() {
    try {
        await testEndpoint('/health');
        return true;
    } catch (error) {
        return false;
    }
}

// 主函数
async function main() {
    const isRunning = await checkServiceRunning();
    
    if (!isRunning) {
        console.log('⚠️  后端服务未运行，请先启动服务:');
        console.log('   docker-compose up -d');
        console.log('   或');
        console.log('   node server.js');
        return;
    }

    await runTests();
}

// 执行测试
if (require.main === module) {
    main();
}

module.exports = { testEndpoint, runTests };