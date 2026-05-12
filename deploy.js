#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'api');
const webDir = path.join(__dirname, 'web');
const wranglerTomlPath = path.join(apiDir, 'wrangler.toml');

function run(command, dir, options = {}) {
  console.log(`\n📦 执行: ${command}`);
  try {
    execSync(command, {
      cwd: dir,
      stdio: options.silent ? 'pipe' : 'inherit',
      shell: true,
      encoding: 'utf-8'
    });
    return true;
  } catch (error) {
    if (options.ignoreError) {
      console.log(`⚠️  忽略错误: ${command}`);
      return false;
    }
    console.error(`❌ 命令执行失败: ${command}`);
    return false;
  }
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function checkWranglerConfig() {
  const content = readFile(wranglerTomlPath);
  const databaseIdMatch = content.match(/database_id\s*=\s*"([^"]+)"/);
  const publicR2UrlMatch = content.match(/PUBLIC_R2_URL\s*=\s*"([^"]+)"/);

  return {
    hasDatabaseId: databaseIdMatch && databaseIdMatch[1] && databaseIdMatch[1] !== 'your-database-id-here',
    hasPublicR2Url: publicR2UrlMatch && publicR2UrlMatch[1] && !publicR2UrlMatch[1].includes('your-account')
  };
}

async function setupInfrastructure() {
  console.log('\n========================================');
  console.log('   蓉姐私房菜 - 首次初始化');
  console.log('========================================\n');

  console.log('⚠️  这将创建 D1 数据库和 R2 Bucket\n');

  // 1. 创建 D1 数据库
  console.log('1️⃣  创建 D1 数据库 rongjie-db...');
  const dbResult = run('npx wrangler d1 create rongjie-db', apiDir);
  if (dbResult) {
    console.log('\n📝  请将返回的 database_id 填入 api/wrangler.toml');
    console.log('   格式: database_id = "你复制的id"\n');
  }

  // 2. 初始化数据库表
  console.log('2️⃣  初始化数据库表...');
  const dbId = readFile(wranglerTomlPath).match(/database_id\s*=\s*"([^"]+)"/)?.[1];
  if (dbId && dbId !== 'your-database-id-here') {
    run(`npx wrangler d1 execute rongjie-db --remote --file=../database/init.sql`, apiDir);
    console.log('✅  数据库表创建成功\n');
  } else {
    console.log('⚠️  跳过（请先配置 database_id）\n');
  }

  // 3. 创建 R2 Bucket
  console.log('3️⃣  创建 R2 Bucket rongjie-images...');
  run('npx wrangler r2 bucket create rongjie-images', apiDir, { ignoreError: true });
  console.log('\n📝  请在 R2 控制台设置自定义域名（可选）');
  console.log('   并将 PUBLIC_R2_URL 填入 api/wrangler.toml\n');

  // 4. 设置 ADMIN_SECRET
  console.log('4️⃣  设置管理员密钥...');
  console.log('   执行: npx wrangler secret put ADMIN_SECRET');
  console.log('   然后输入你的管理员密钥\n');

  // 5. 检查配置
  console.log('5️⃣  检查配置...');
  const config = checkWranglerConfig();
  console.log(`   ${config.hasDatabaseId ? '✅' : '❌'} database_id: ${config.hasDatabaseId ? '已配置' : '未配置'}`);
  console.log(`   ${config.hasPublicR2Url ? '✅' : '❌'} PUBLIC_R2_URL: ${config.hasPublicR2Url ? '已配置' : '未配置'}`);

  console.log('\n========================================');
  console.log('   初始化完成！');
  console.log('========================================\n');
  console.log('📋  后续步骤:');
  console.log('   1. 编辑 api/wrangler.toml，填入 database_id 和 PUBLIC_R2_URL');
  console.log('   2. 执行: npx wrangler secret put ADMIN_SECRET');
  console.log('   3. 执行: npm run deploy\n');
}

async function deployFrontend() {
  console.log('\n========================================');
  console.log('   蓉姐私房菜 - 前端部署');
  console.log('========================================\n');

  console.log('\n=== 1. 构建前端 ===');
  if (!run('npm run build', webDir)) {
    process.exit(1);
  }

  console.log('\n=== 2. 部署前端 ===');
  if (!run('npx wrangler pages deploy dist --project-name=rongjie-private-kitchen', webDir)) {
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('   ✅ 前端部署完成！');
  console.log('========================================\n');
}

async function deployBackend() {
  console.log('\n========================================');
  console.log('   蓉姐私房菜 - 后端部署');
  console.log('========================================\n');

  const config = checkWranglerConfig();
  console.log('📋  配置检查:');
  console.log(`   ${config.hasDatabaseId ? '✅' : '❌'} database_id`);
  console.log(`   ${config.hasPublicR2Url ? '✅' : '❌'} PUBLIC_R2_URL`);

  if (!config.hasDatabaseId || !config.hasPublicR2Url) {
    console.log('\n❌  配置不完整，请先运行: npm run deploy -- --init\n');
    process.exit(1);
  }

  console.log('\n=== 部署 API ===');
  if (!run('npm run deploy', apiDir)) {
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('   ✅ 后端部署完成！');
  console.log('========================================\n');
}

async function deploy() {
  console.log('\n========================================');
  console.log('   蓉姐私房菜 - 一键部署');
  console.log('========================================\n');

  const config = checkWranglerConfig();
  console.log('📋  配置检查:');
  console.log(`   ${config.hasDatabaseId ? '✅' : '❌'} database_id`);
  console.log(`   ${config.hasPublicR2Url ? '✅' : '❌'} PUBLIC_R2_URL`);

  if (!config.hasDatabaseId || !config.hasPublicR2Url) {
    console.log('\n❌  配置不完整，请先运行: npm run deploy -- --init\n');
    process.exit(1);
  }

  // 1. 构建前端
  console.log('\n=== 1. 构建前端 ===');
  if (!run('npm run build', webDir)) {
    process.exit(1);
  }

  // 2. 部署 API
  console.log('\n=== 2. 部署 API ===');
  if (!run('npm run deploy', apiDir)) {
    process.exit(1);
  }

  // 3. 部署前端
  console.log('\n=== 3. 部署前端 ===');
  if (!run('npx wrangler pages deploy dist --project-name=rongjie-private-kitchen', webDir)) {
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('   ✅ 部署完成！');
  console.log('========================================\n');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--init') || args.includes('-i')) {
    await setupInfrastructure();
  } else if (args.includes('--frontend') || args.includes('-f')) {
    await deployFrontend();
  } else if (args.includes('--backend') || args.includes('-b')) {
    await deployBackend();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📦 蓉姐私房菜部署脚本

用法:
  npm run deploy              一键部署（前端+后端）
  npm run deploy -- --frontend  仅部署前端
  npm run deploy -- --backend  仅部署后端
  npm run deploy -- --init     首次初始化 + 部署
  npm run deploy -- --help      显示帮助

首次使用请按顺序执行:
  1. npm run deploy -- --init   # 初始化基础设施
  2. 编辑 api/wrangler.toml     # 填入 database_id 和 PUBLIC_R2_URL
  3. npx wrangler secret put ADMIN_SECRET  # 设置密钥
  4. npm run deploy             # 部署
`);
  } else {
    await deploy();
  }
}

main();
