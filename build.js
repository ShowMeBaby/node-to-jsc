const child_process = require('child_process');
const path = require('path');
const fs = require('fs');
/*
 * 工具函数
 */
async function execute(cmd) {
	return new Promise((resolve, reject) => {
		child_process.exec(cmd, function (error, stdout, stderr) {
			if (error) {
				reject(error);
			} else {
				resolve(stdout);
			}
		});
	}).catch(err => {
		console.log(err);
	})
}

function createDir(dirPath) {
	try {
		fs.mkdirSync(dirPath)
	} catch (e) {
		console.log(`文件夹${dirPath}已存在`)
	}
}

function copyFile(copiedPath, resultPath) {
	fs.promises.copyFile(copiedPath, resultPath).catch((err) => {
		console.log(`复制文件${copiedPath}失败: ${err}`)
	})
}

function copyDir(copiedPath, resultPath) {
	if (fs.existsSync(copiedPath)) {
		createDir(resultPath)
		const files = fs.readdirSync(copiedPath, {
			withFileTypes: true
		});
		for (let i = 0; i < files.length; i++) {
			const cf = files[i]
			const ccp = path.join(copiedPath, cf.name)
			const crp = path.join(resultPath, cf.name)
			if (cf.isFile()) {
				// 复制文件
				copyFile(ccp, crp)
			} else {
				try {
					// 判断读(R_OK | W_OK)写权限
					fs.accessSync(path.join(crp, '..'), fs.constants.W_OK)
					copyDir(ccp, crp, true)
				} catch (error) {
					console.log(`复制${ccp}失败 :`, error);
				}
			}
		}
	} else {
		console.log(`路径不存在: ${copiedPath}`);
	}
}
async function delDir(path) {
	return new Promise((resolve, reject) => {
		let files = [];
		if (fs.existsSync(path)) {
			files = fs.readdirSync(path);
			files.forEach((file, index) => {
				let curPath = path + "/" + file;
				if (fs.statSync(curPath).isDirectory()) {
					delDir(curPath); //递归删除文件夹
				} else {
					fs.unlinkSync(curPath); //删除文件
				}
			});
			fs.rmdirSync(path);
		}
		resolve();
	}).catch(err => {
		console.log('删除临时文件夹失败,请手动删除');
	});
}
/*
 * 主逻辑
 */
async function main() {
	console.log('清空临时文件夹');
	await delDir(config.tempDir).then(() => {
		return new Promise((resolve, reject) => {
			console.log('整理各服文件中,请自行处理各服同名文件');
			config.serverDir.forEach(serverName => {
				copyDir(serverName, config.tempDir)
			});
			console.log('整理各服文件完成');
			resolve();
		})
	}).then(() => {
		console.log('导入统一入口app.js');
		copyFile(config.appjsPath, config.tempDir + '/app.js');
		console.log('导入统一入口app.js完成');
	});
	console.log('ncc开始打包');
	await execute(`ncc build ${config.tempDir + '/app.js'} -o ${config.tempDir}/temp_ncc/ `).then(res => {
		console.log('ncc打包完成');
		console.log('开始混淆代码');
		return execute(
			`javascript-obfuscator ./${config.tempDir}/temp_ncc/index.js --output ./${config.tempDir}/temp_obfuscator/index-obfuscator.js`
		);
	}).then(res => {
		console.log('混淆代码完成');
		console.log('开始编译代码');
		return execute(`bytenode --compile ./${config.tempDir}/temp_obfuscator/index-obfuscator.js`);
	}).then(res => {
		console.log('编译代码完成');
	});
	console.log('清空输出文件夹');
	await delDir(config.outputDir).then(() => {
		createDir(config.outputDir);
		console.log('导出jsc文件');
		fs.copyFileSync(`./${config.tempDir}/temp_obfuscator/index-obfuscator.jsc`, `${config.outputDir}/app.jsc`);
		console.log('导入配置文件');
		copyDir(config.copyDir, config.outputDir);
		console.log('导入配置文件完成');
		console.log('删除临时文件夹');
		return delDir(config.tempDir);
	}).then(() => {
		console.log('删除临时文件夹成功');
	});
	console.log(`编译完成 打包文件夹:${config.outputDir}`);
}
const config = {
	appjsPath: './app.js', // 整合出的各服统一入口app.js,原各服的app.js应整合进改js文件
	tempDir: './temp_dist', // 打包过程中所使用的临时文件夹
	serverDir: ['server'], // 需要整合的服文件夹
	copyDir: './build_pack', // 需要原封不动移动的文件或文件夹
	outputDir: './dist',
};
main();