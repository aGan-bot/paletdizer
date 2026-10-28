const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('dist/optimizer.js','utf8');
const context = vm.createContext({assert,console});
vm.runInContext(source.slice(0,source.indexOf('\nsetupResizableLayout();')),context);
vm.runInContext(`
  const x={x:400,y:0,centerOffset:20,support:1};
  const y={x:0,y:400,centerOffset:10,support:1};
  assert.equal(preferPlacement(x,y,0,0),true);
  assert.equal(preferPlacement(x,y,0,1),false);
  assert.equal(preferPlacement(x,y,200,0),false);
  assert.equal(preferPlacement(x,y,200,1),false);
  const tie={...x,centerOffset:y.centerOffset};
  assert.equal(preferPlacement(tie,y,200,0),true);
  assert.equal(preferPlacement(tie,y,200,1),false);
  assert.equal(preferPlacement({...tie,support:.75},y,200,0),false);
  assert.equal(preferPlacement(tie,y,200,undefined),false);
  assert.equal(preferPlacement(x,y,200,undefined),false);
  // This comparator remains for the analytic decoder; current GA genes use check-contact.cjs.
  console.log('Legacy analytic preference comparator passed.');
`, context);
