// node kalyptik/modules/examen-2027/tests/rules.test.js
const assert = require('assert');
const R = require('../scripts/rules.js');
const {NBSP, NNBSP} = R;
const fixes = text => R.check(text).filter(i => i.replacement != null).map(i => [i.found, i.replacement]);
const rules = text => R.check(text).map(i => i.rule);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok -', name); };

t('ponctuation haute', () => {
    assert.deepStrictEqual(fixes('Calculer f(2) ; conclure.'), [[') ;', ')' + NNBSP + ';']]);
    assert.deepStrictEqual(fixes('Pourquoi?'), [['i?', 'i' + NNBSP + '?']]);
    assert.deepStrictEqual(fixes('On donne : la fonction'), [['e :', 'e' + NBSP + ':']]);
    assert.deepStrictEqual(rules('Correct' + NNBSP + '; et' + NBSP + ': ok' + NNBSP + '!'), []);
    assert.deepStrictEqual(rules('à 10:30 sur https://exemple.fr'), []);
});
t('espace après ; ! ?', () => {
    assert.ok(fixes('a' + NNBSP + ';b').some(f => f[1] == ';' + ' b'));
});
t('virgule et point', () => {
    assert.deepStrictEqual(fixes('Soit x , un réel .'), [['x ,', 'x,'], ['l .', 'l.']]);
    assert.deepStrictEqual(fixes('pommes,poires'), [['pommes,poires', 'pommes, poires']]);
    assert.deepStrictEqual(fixes('vaut 3 , 5 cm'), [['3 , 5', '3,5']]);
    assert.deepStrictEqual(rules('vaut 3,5 cm, puis 2.'), []);
});
t('parenthèses', () => {
    assert.deepStrictEqual(fixes('( voir annexe )'), [['( v', '(v'], ['e )', 'e)']]);
});
t('guillemets', () => {
    assert.deepStrictEqual(fixes('le mot "rayon" ici'), [['"rayon"', '«' + NBSP + 'rayon' + NBSP + '»']]);
    assert.deepStrictEqual(fixes('le «rayon» ici'), [['«r', '«' + NBSP + 'r'], ['n»', 'n' + NBSP + '»']]);
    assert.deepStrictEqual(rules('le «' + NBSP + 'rayon' + NBSP + '» ici'), []);
});
t('ordinaux', () => {
    const f = R.check('la 1ère et la 2ème question, le 3e, la nème');
    assert.deepStrictEqual(f.map(i => [i.found, i.replacement, i.fix]),
        [['1ère', '1re', 'ordinal'], ['2ème', '2e', 'ordinal'], ['nème', 'n-ième', 'replace']]);
    assert.deepStrictEqual(fixes('le i-ème terme ou jème'), [['jème', 'j-ème']]);
    assert.deepStrictEqual(rules('un thème, le système, la 1re, le 2e'), []);
});
t('unités', () => {
    assert.deepStrictEqual(fixes('en 15 mn et 2 H'), [['5 mn', '5 min'], ['2 H', '2 h']]);
    assert.deepStrictEqual(fixes('coûte 12 EUR ou 3 E'), [['2 EUR', '2 €'], ['3 E', '3 €']]);
    assert.deepStrictEqual(fixes('une somme de 3 € 55'), [['3 € 55', '3,55' + NBSP + '€']]);
    assert.deepStrictEqual(rules('en 15 min et 2 h pour 3,55 €'), []);
});
t('nombres', () => {
    assert.deepStrictEqual(fixes('environ 1250000 habitants'), [['1250000', '1' + NBSP + '250' + NBSP + '000']]);
    assert.deepStrictEqual(fixes('environ 12 345 habitants'), [['12 345', '12' + NBSP + '345']]);
    assert.deepStrictEqual(rules('le 6 octobre 1997, page 1251, carte au 1/25000'), []);
    assert.strictEqual(R.groupDigits('1234567'), '1' + NBSP + '234' + NBSP + '567');
});
t('multiplication', () => {
    assert.deepStrictEqual(fixes('un carré de 3 x 4 cm'), [['3 x 4', '3 × 4']]);
    assert.deepStrictEqual(rules('le réel x vaut 4'), []);
});
t('opérateurs dans le texte', () => {
    const i = R.check('montrer que la vitesse = distance divisée');
    assert.strictEqual(i[0].rule, 'operateur');
    assert.strictEqual(i[0].fix, null);
});
console.log(n + ' tests réussis');
