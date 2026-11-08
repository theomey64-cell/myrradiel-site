// Présentation seulement : les textes et les routes Discord sont conservés.
document.querySelectorAll('.document-section .document-card').forEach((article) => {
  const nodes = Array.from(article.children);
  const section = article.closest('.document-section');
  const isWiki = section?.id === 'wiki';
  const headings = nodes.filter(el => el.matches(isWiki ? 'h1,h2' : 'h2'));
  if (!headings.length) return;
  let group = null;
  for (const node of nodes) {
    if (headings.includes(node)) {
      group = document.createElement('details');
      group.className = 'arcane-entry';
      const summary = document.createElement('summary');
      summary.className = 'arcane-tab';
      const icon = document.createElement('span');
      icon.className = 'arcane-icon'; icon.textContent = '✧';
      const title = document.createElement('span');
      title.className = 'arcane-title'; title.textContent = node.textContent.trim();
      const chevron = document.createElement('span');
      chevron.className = 'arcane-chevron'; chevron.textContent = '⌄';
      summary.append(icon,title,chevron);
      const body = document.createElement('div'); body.className = 'arcane-body';
      group.append(summary,body);
      node.replaceWith(group);
      if(node.id) group.id=node.id;
    } else if (group) {
      group.lastElementChild.appendChild(node);
    }
  }
});
// Autoriser les liens directs vers un chapitre replié.
function revealHash(){
 const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
 if(target?.matches('details.arcane-entry')) target.open=true;
}
window.addEventListener('hashchange',revealHash);revealHash();
