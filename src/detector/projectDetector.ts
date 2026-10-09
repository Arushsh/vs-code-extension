import * as fs from 'fs';
import * as path from 'path';
import { ProjectInfo } from '../types';

interface PackageJson {
  name?: string;
  version?: string;
  description?: string;
  main?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export class ProjectDetector {
  private pkgJson: PackageJson = {};

  constructor(private rootPath: string) {}

  async detect(totalFiles: number, totalFolders: number): Promise<ProjectInfo> {
    // Read package.json
    const pkgPath = path.join(this.rootPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        this.pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      } catch {
        this.pkgJson = {};
      }
    }

    const framework = this.detectFramework();
    const language = this.detectLanguage();
    const packageManager = this.detectPackageManager();
    const buildTool = this.detectBuildTool(framework);
    const entryPoint = this.detectEntryPoint(framework);
    const dependencies = this.pkgJson.dependencies ?? {};
    const devDeps = this.pkgJson.devDependencies ?? {};

    return {
      name: this.pkgJson.name ?? path.basename(this.rootPath),
      version: this.pkgJson.version ?? '1.0.0',
      description: this.pkgJson.description ?? '',
      framework,
      language,
      packageManager,
      buildTool,
      entryPoint,
      totalFiles,
      totalFolders,
      totalDependencies: Object.keys(dependencies).length,
      devDependencies: Object.keys(devDeps).length,
      scripts: this.pkgJson.scripts ?? {},
      dependencies,
      rootPath: this.rootPath,
    };
  }

  private detectFramework(): string {
    const deps = {
      ...this.pkgJson.dependencies,
      ...this.pkgJson.devDependencies,
    };

    // Check config files first (most reliable)
    if (fs.existsSync(path.join(this.rootPath, 'next.config.js')) ||
        fs.existsSync(path.join(this.rootPath, 'next.config.ts')) ||
        fs.existsSync(path.join(this.rootPath, 'next.config.mjs'))) {
      return 'Next.js';
    }

    if (fs.existsSync(path.join(this.rootPath, 'vite.config.ts')) ||
        fs.existsSync(path.join(this.rootPath, 'vite.config.js'))) {
      // Could be React+Vite, Vue+Vite, etc.
      if (deps['react']) return 'React + Vite';
      if (deps['vue']) return 'Vue + Vite';
      return 'Vite';
    }

    if (fs.existsSync(path.join(this.rootPath, 'angular.json'))) {
      return 'Angular';
    }

    if (fs.existsSync(path.join(this.rootPath, 'svelte.config.js'))) {
      return 'SvelteKit';
    }

    // Package.json dependencies
    if (deps['next']) return 'Next.js';
    if (deps['react'] && deps['react-dom']) return 'React';
    if (deps['vue']) return 'Vue.js';
    if (deps['svelte']) return 'Svelte';
    if (deps['express']) return 'Express.js';
    if (deps['fastify']) return 'Fastify';
    if (deps['@nestjs/core']) return 'NestJS';
    if (deps['nuxt']) return 'Nuxt.js';

    // Node.js fallback
    if (fs.existsSync(path.join(this.rootPath, 'package.json'))) {
      return 'Node.js';
    }

    return 'Unknown';
  }

  private detectLanguage(): string {
    if (fs.existsSync(path.join(this.rootPath, 'tsconfig.json'))) {
      return 'TypeScript';
    }

    // Check if there are any .ts files
    const hasTsFiles = this.searchForExtension(this.rootPath, '.ts', 3);
    if (hasTsFiles) return 'TypeScript';

    return 'JavaScript';
  }

  private detectPackageManager(): string {
    if (fs.existsSync(path.join(this.rootPath, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(this.rootPath, 'yarn.lock'))) return 'yarn';
    if (fs.existsSync(path.join(this.rootPath, 'bun.lockb'))) return 'bun';
    if (fs.existsSync(path.join(this.rootPath, 'package-lock.json'))) return 'npm';
    return 'npm';
  }

  private detectBuildTool(framework: string): string {
    if (framework.includes('Vite') || framework.includes('React + Vite')) return 'Vite';
    if (framework === 'Next.js') return 'Webpack / Turbopack';
    if (framework === 'Angular') return 'Angular CLI';

    const devDeps = this.pkgJson.devDependencies ?? {};
    if (devDeps['vite']) return 'Vite';
    if (devDeps['webpack']) return 'Webpack';
    if (devDeps['rollup']) return 'Rollup';
    if (devDeps['esbuild']) return 'esbuild';
    if (devDeps['parcel']) return 'Parcel';

    return 'None / Custom';
  }

  private detectEntryPoint(framework: string): string {
    const candidates: string[] = [];

    // Framework-specific
    if (framework.includes('Next.js')) {
      const appDir = path.join(this.rootPath, 'app', 'page.tsx');
      const pagesDir = path.join(this.rootPath, 'pages', 'index.tsx');
      if (fs.existsSync(appDir)) candidates.push('app/page.tsx');
      if (fs.existsSync(pagesDir)) candidates.push('pages/index.tsx');
    }

    // Common entry points
    const common = [
      'src/main.tsx', 'src/main.ts', 'src/index.tsx', 'src/index.ts',
      'src/App.tsx', 'src/App.ts', 'index.ts', 'index.js',
      'server.ts', 'server.js', 'app.ts', 'app.js',
    ];

    for (const ep of common) {
      if (fs.existsSync(path.join(this.rootPath, ep))) {
        candidates.push(ep);
      }
    }

    // From package.json main field
    if (this.pkgJson.main) candidates.push(this.pkgJson.main);

    return candidates[0] ?? 'Unknown';
  }

  private searchForExtension(dir: string, ext: string, maxDepth: number): boolean {
    if (maxDepth === 0) return false;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith(ext)) return true;
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
          if (this.searchForExtension(path.join(dir, entry.name), ext, maxDepth - 1)) {
            return true;
          }
        }
      }
    } catch {
      // ignore
    }
    return false;
  }
}
