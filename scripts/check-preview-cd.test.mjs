import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const yaml=readFileSync(new URL('../.github/workflows/deploy-ui-core-preview.yml',import.meta.url),'utf8');
test('a standalone preview branch is the only automation trigger',()=>{
  assert.match(yaml,/^  push:\n    branches:\n      - preview\/ui-core/m);
  assert.doesNotMatch(yaml,/workflow_dispatch:|workflow_run:|pull_request:/);
  assert.match(yaml,/github\.ref == 'refs\/heads\/preview\/ui-core'/);
  assert.match(yaml,/github\.repository == 'agencia-zenit-br\/zenit-design-lab'/);
  assert.match(yaml,/cancel-in-progress: false/);
});
test('verification is a hard deployment dependency',()=>{
  assert.match(yaml,/^  verify:\n/m);
  assert.match(yaml,/^  deploy:\n    name: Update isolated Cloud Run preview\n    needs: verify/m);
  assert.match(yaml,/needs\.verify\.result == 'success'/);
  for(const check of ['npm ci --no-audit --no-fund','npm run check:design','npm run build',
    'npm run build-storybook -- --quiet','npm run check:browser']){
    assert.ok(yaml.includes(check),'Verification step missing: '+check);
  }
});
test('preview has dedicated least-privilege credentials and immutable source',()=>{
  assert.match(yaml,/environment: ui-core-preview/);
  assert.match(yaml,/GCP_UI_CORE_WIF_PROVIDER/);
  assert.match(yaml,/GCP_UI_CORE_DEPLOY_SERVICE_ACCOUNT/);
  assert.match(yaml,/workloadIdentityPools\/zenit-ui-core-preview\/providers\/github-actions/);
  assert.match(yaml,/zenit-ui-core-preview-deployer@zenit-platform-labs\.iam\.gserviceaccount\.com/);
  assert.match(yaml,/never reuse original Design Lab WIF/);
  assert.match(yaml,/never use original Design Lab deployer\/runtime/);
  assert.match(yaml,/ref: \$\{\{ github.sha \}\}/);
  assert.match(yaml,/zenit-ui-core-preview@zenit-platform-labs\.iam\.gserviceaccount\.com/);
  assert.match(yaml,/IMAGE: southamerica-east1-docker\.pkg\.dev\/zenit-platform-labs\/zenit-ui-core-preview\/ui-core/);
  assert.match(yaml,/repositories describe zenit-ui-core-preview/);
  assert.match(yaml,/docker push "\$IMAGE:\$GITHUB_SHA"/);
  assert.match(yaml,/\$IMAGE@\$IMAGE_DIGEST/);
});
test('existing isolated service, labels, health and rollback are mandatory',()=>{
  assert.match(yaml,/SERVICE: zenit-ui-core-preview/);
  assert.match(yaml,/test "\$SERVICE" = zenit-ui-core-preview/);
  assert.match(yaml,/\.metadata\.labels\.zenit_scope/);
  assert.match(yaml,/\.metadata\.labels\.zenit_purpose/);
  assert.match(yaml,/test -n "\$previous"/);
  assert.match(yaml,/__zenit_health/);
  assert.match(yaml,/--to-revisions="\$PREVIOUS_REVISION=100"/);
  assert.doesNotMatch(yaml,/gcloud run deploy zenit-design-lab|gcloud sql |--allow-unauthenticated|--update-secrets/);
});

test('container compiles the validated application without copying GitHub internals',()=>{
  const docker=readFileSync(new URL('../Dockerfile',import.meta.url),'utf8');
  const ignore=readFileSync(new URL('../.dockerignore',import.meta.url),'utf8');
  const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
  assert.match(ignore,/^\.github$/m);
  assert.match(docker,/RUN npm ci --no-audit --no-fund/);
  assert.match(docker,/RUN npm run build:runtime/);
  assert.doesNotMatch(docker,/^RUN npm run build$/m,'Docker may not rerun CI checks dependent on ignored files');
  assert.equal(pkg.scripts['build:runtime'],'tsc -b && vite build');
  assert.match(pkg.scripts.build,/npm run check:design/);
  assert.match(pkg.scripts.build,/npm run test:temporal/);
  assert.match(pkg.scripts.build,/npm run test:operational/);
  assert.match(pkg.scripts.build,/npm run build:runtime/);
});
