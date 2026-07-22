import { execFileSync } from 'node:child_process';

const StagedFiles = execFileSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACMR'],
    { encoding: 'utf8' },
)
    .split(/\r?\n/u)
    .filter(Boolean);

const BlockedFiles = StagedFiles.filter((FilePath) => (
    FilePath === 'AgentWorks'
    || FilePath.startsWith('AgentWorks/')
    || FilePath === 'docs'
    || FilePath.startsWith('docs/')
));

if (BlockedFiles.length > 0)
{
    console.error('Git 공개 범위에서 제외된 파일이 stage되었습니다:');
    BlockedFiles.forEach((FilePath) => console.error(`- ${FilePath}`));
    console.error('AgentWorks/ 및 docs/ 파일을 stage에서 제외한 뒤 다시 시도하세요.');
    process.exit(1);
}

console.log('Git 공개 범위 검사를 통과했습니다.');
