// Real upstream templates, Button/ToggleManager/Mixtbar and compiled editor CSS.
// This is a UI integration harness, not a document-engine or Qt end-to-end test.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const less = require('less');
const {chromium} = require('@playwright/test');
const root = path.resolve(__dirname, '../../../..');
const apps = path.join(root, 'web-apps/apps');
const vendor = path.join(root, 'web-apps/vendor');
const output = process.env.KALYPTIK_TEST_OUTPUT || path.join(__dirname, 'artifacts');
const read = p => fs.readFileSync(p, 'utf8');
const editors = ['documenteditor','spreadsheeteditor','presentationeditor','pdfeditor','visioeditor'];

(async () => {
 fs.mkdirSync(output, {recursive:true});
 const browser = await chromium.launch({headless:true, executablePath:process.env.KALYPTIK_CHROMIUM || undefined});
 try {
  for (const editor of editors) {
   const source = path.join(apps, editor, 'main/resources/less/app.less');
   const compiled = await less.render(read(source), {filename:source, math:'always', javascriptEnabled:true});
   assert(compiled.css.includes('data:font/woff2;base64,d09GMg'), 'font must be packaged offline');
   fs.writeFileSync(path.join(output, editor+'.css'), compiled.css);
   for (const mode of ['light','dark']) {
    const page = await browser.newPage({viewport:{width:1440,height:500}});
    const errors = [];
    page.on('pageerror', e=>errors.push(e.message));
    const theme = JSON.parse(read(path.join(root,'kalyptik/theme/uithemes/kalyptik-'+mode+'.json')));
    const tokens = Object.entries(theme.colors).map(([k,v])=>'--'+k+':'+v+';').join('');
    await page.setContent('<html><head></head><body class="'+theme.id+'"><div id="box-document-title" style="height:42px;padding:10px"><span id="title-doc-name">Kalyptik Office — '+editor+'</span></div><div id="toolbar"></div><div id="canvas-proof">Zone de document (hors périmètre du test)</div></body></html>');
    await page.addStyleTag({content:compiled.css+'\n:root .'+theme.id+'{'+tokens+'}\n#canvas-proof{height:260px;background:var(--canvas-background);padding:30px;color:var(--text-secondary)}'});
    for(const name of ['jquery/jquery.js','underscore/underscore-umd.js','backbone/backbone.js'])
     await page.addScriptTag({content:read(path.join(vendor,name))});
    await page.evaluate(() => {
     window.Common={UI:{isRTL:()=>false},Utils:{isGecko:false}};
     window.modules={backbone:Backbone,underscore:_};
     window.define=(deps,callback)=>{window.lastModule=callback(...deps.map(d=>window.modules[d]));};
    });
    for(const name of ['core/NotificationCenter','component/BaseView','component/ToggleManager','component/Button','component/KalyptikRibbon','component/Mixtbar']) {
     await page.addScriptTag({content:read(path.join(apps,'common/main/lib',name+'.js'))});
     if(name.endsWith('KalyptikRibbon'))await page.evaluate(()=>{modules['common/main/lib/component/KalyptikRibbon']=lastModule;});
    }
    // Visio has a viewer toolbar, the other editors expose an editing toolbar.
    const templatePath = path.join(apps,editor,'main/app/template/Toolbar.template');
    const fallback = path.join(apps,editor,'main/app/template/ToolbarView.template');
    const template = read(fs.existsSync(templatePath)?templatePath:fallback);
    await page.evaluate(({template})=>{
     const config={isEdit:true,lang:'fr',isDesktopApp:true,isOffline:true};
     const view=new Common.UI.Mixtbar({el:'#toolbar',template:_.template(template),config,tabs:[
      {caption:'Fichier',action:'file',haspanel:false},{caption:'Accueil',action:'home'},
      {caption:'Insertion',action:'ins'},{caption:'Affichage',action:'view'}]});
     $('#toolbar').append(view.$layout);
     view.afterRender();
     window.view=view;
     const panels=view.$layout.find('.box-panels > .panel');
     (panels.filter('[data-tab=home]').length?panels.filter('[data-tab=home]'):panels.first()).addClass('active');
     view.$layout.find('.ribtab').eq(1).addClass('active');
     window.slotsBefore=[...document.querySelectorAll('.btn-slot[id]')].map(n=>n.id);
     modules['common/main/lib/component/KalyptikRibbon'].decorate(view.$layout[0],config);
     modules['common/main/lib/component/KalyptikRibbon'].decorate(view.$layout[0],config);
     window.slotsAfter=[...document.querySelectorAll('.btn-slot[id]')].map(n=>n.id);
     window.buttons={};
     document.querySelectorAll('.field-styles').forEach(slot=>{
      slot.innerHTML='<div style="height:60px;display:flex;gap:8px"><div style="min-width:85px;padding:10px;border:1px solid var(--border-regular-control);font-size:12px">AaBbCc<br>Normal</div><div style="min-width:85px;padding:10px;border:1px solid var(--border-regular-control);font-size:12px;color:var(--text-link)">AaBbCc<br>Titre 1</div></div>';
     });
     document.querySelectorAll('.btn-slot').forEach((slot,index)=>{
      if(slot.closest('.btn-slot')!==slot || slot.children.length)return;
      const id=slot.id||'fixture-slot-'+index;
      if(id.includes('field-font')||id==='slot-btn-format') {
       const input=document.createElement('input');input.className='form-control';input.value=id.includes('size')?'11':id==='slot-btn-format'?'Standard':'Aptos';input.style.width=id.includes('size')?'45px':'128px';slot.append(input);return;
      }
      if(id==='slot-field-styles'){slot.innerHTML='<div style="height:60px;padding:14px;border:1px solid var(--border-regular-control)">Normal　 Titre 1　 Titre 2</div>';return;}
      const icon=id.replace(/^slot-/,'');
      const huge=slot.classList.contains('x-huge');
      const caption=huge?icon.replace(/^btn-/,'').slice(0,12):'';
      const btn=new Common.UI.Button({id:'test-'+index,cls:'btn-toolbar'+(huge?' x-huge':''),iconCls:'toolbar__icon '+icon,caption,scaling:false,enableToggle:id==='slot-btn-bold',ariaLabel:id});
      btn.render($(slot));buttons[id]=btn;
     });
    },{template});
    // Inject actual upstream vector assets for all fixture buttons.
    const iconNames=await page.locator('svg use').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.getAttribute('href').slice(1)))]);
    const symbols=[];
    for(const name of iconNames){
     const file=path.join(apps,'common/main/resources/img/toolbar/v2/2.5x',name+'.svg');
     if(fs.existsSync(file))symbols.push(read(file).replace('<svg ', '<svg id="'+name+'" '));
    }
    await page.evaluate(symbols=>{const holder=document.createElement('div');holder.style.display='none';holder.innerHTML=symbols.join('');document.body.append(holder);},symbols);
    await page.evaluate(()=>document.fonts.ready);
    assert.deepEqual(await page.evaluate(()=>slotsAfter),await page.evaluate(()=>slotsBefore),'command slots must remain intact');
    const labels=await page.locator('[data-kalyptik-label]').count();
    if(editor!=='visioeditor')assert(labels>0,'expected semantic groups');
    const font=await page.locator('body').evaluate(n=>getComputedStyle(n).fontFamily);
    assert(font.includes('Plus Jakarta Sans'),'ProfZen UI font');
    assert(await page.evaluate(()=>document.fonts.check('12px "Plus Jakarta Sans"')),'font loaded offline');
    const geometry=await page.locator('.box-controls').first().evaluate(n=>({height:n.getBoundingClientRect().height,background:getComputedStyle(n).backgroundColor}));
    assert.equal(geometry.height,106,'shared toolbar height');
    assert.equal(geometry.background,mode==='light'?'rgb(255, 255, 255)':'rgb(53, 36, 80)');
    if (mode==='dark') {
     const luminance = hex => {
      const rgb=hex.match(/[0-9a-f]{2}/gi).map(v=>parseInt(v,16)/255)
       .map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
      return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
     };
     for (const foreground of ['text-normal','text-secondary','icon-normal']) {
      const contrast=(luminance(theme.colors[foreground])+0.05)/(luminance(theme.colors['background-toolbar'])+0.05);
      assert(contrast>=4.5,foreground+' must remain readable on the purple ribbon');
     }
     await page.evaluate(()=>{
      const raster=document.createElement('i');raster.className='toolbar__icon';raster.id='raster-proof';
      document.getElementById('toolbar').append(raster);
     });
     const raster=await page.locator('#raster-proof').evaluate(n=>getComputedStyle(n).filter);
     assert.equal(raster,'brightness(0) invert(1)','raster icons must also be light');
     await page.locator('#raster-proof').evaluate(n=>n.remove());
     if (await page.locator('#toolbar svg.icon').count()) {
      const vector=await page.locator('#toolbar svg.icon').first().evaluate(n=>getComputedStyle(n).color);
      assert.equal(vector,'rgb(245, 240, 255)','stroke icons using currentColor must be light');
     }
    }
    const clippedLabels=await page.locator('[data-kalyptik-label]').evaluateAll(nodes=>nodes.filter(n=>{
     if(!n.getBoundingClientRect().width)return false;
     const style=getComputedStyle(n,'::after');
     const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');ctx.font=style.font;
     return ctx.measureText(n.dataset.kalyptikLabel).width>n.getBoundingClientRect().width-8;
    }).map(n=>n.dataset.kalyptikLabel));
    assert.deepEqual(clippedLabels,[],'visible ribbon group labels must fit');
    if(await page.evaluate(()=>!!buttons['slot-btn-bold'])) {
     await page.locator('#slot-btn-bold button').click();
     assert(await page.evaluate(()=>buttons['slot-btn-bold'].pressed),'real Button toggle');
     await page.evaluate(()=>buttons['slot-btn-bold'].setDisabled(true));
     assert(await page.locator('#slot-btn-bold button').isDisabled(),'disabled editor commands remain disabled');
    }
    await page.screenshot({path:path.join(output,editor+'-'+mode+'.png')});
    // Fold and expand the real Mixtbar, retaining command nodes and listeners.
    await page.evaluate(()=>{view.$layout.addClass('folded');});
    await page.waitForFunction(()=>document.querySelector('.toolbar').getBoundingClientRect().height<106);
    const folded=await page.locator('.toolbar').evaluate(n=>n.getBoundingClientRect().height);
    assert(folded<106,'collapsed toolbar releases canvas space');
    await page.evaluate(()=>view.$layout.addClass('expanded'));
    await page.waitForFunction(()=>document.querySelector('.toolbar').getBoundingClientRect().height>106);
    assert((await page.locator('.toolbar').evaluate(n=>n.getBoundingClientRect().height))>106);
    await page.setViewportSize({width:800,height:500});
    await page.evaluate(()=>{view.$layout.removeClass('folded expanded');document.body.classList.add('rtl');});
    assert.equal(await page.locator('.box-controls').first().evaluate(n=>n.getBoundingClientRect().height),106);
    // Changing away from Kalyptik hides labels and restores the upstream height.
    await page.evaluate(()=>{document.body.className='theme-white';});
    assert.equal(await page.locator('.box-controls').first().evaluate(n=>n.getBoundingClientRect().height),84);
    if(labels)assert.equal(await page.locator('[data-kalyptik-label]').first().evaluate(n=>getComputedStyle(n,'::after').content),'none');
    assert.deepEqual(errors,[], 'browser console errors');
    console.log(editor+' / '+mode+': compiled CSS, offline font, groups, Button state, folded/expanded, narrow RTL, theme switch OK');
    await page.close();
   }
  }
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
