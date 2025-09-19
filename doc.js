window.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.tsd-toolbar-contents')
  if (!nav) {
    return
  }
  const paths = location.pathname.split('/').filter(Boolean)
  let last = -1
  for (let i = paths.length - 1; i >= 0; --i) {
    if (/doc[s]?$/.test(paths[i])) {
      last = i
      break
    }
  }
  const depth = paths.length - last - 2
  const up = Array(depth).fill('..').join('/') || '.'
  const link = document.createElement('a')
  link.href = `${up}/index.html`
  link.textContent = '⬆️ Home'
  link.style.fontWeight = 'bold'
  link.style.marginLeft = '1rem'
  nav.appendChild(link)
})
