# AcadMeta Demo

Landing page de uma academia fictícia, feita para praticar design engineering de UI
seguindo a skill [`emil-design-eng`](.claude/skills/emil-design-eng/SKILL.md).
HTML, CSS e JavaScript puros: sem framework e sem build.

## Como abrir

- **Local:** baixe ou clone o repositório e dê dois cliques em `index.html`.
- **Online:** ative o GitHub Pages (Settings → Pages → Deploy from a branch → `main` / `(root)`).

Arquivos: `index.html` (estrutura), `styles.css` (visual e movimento), `script.js` (interações).

## Princípios da skill aplicados

Base comum: curvas customizadas (`--ease-out`, `--ease-in-out`, `--ease-drawer`) e durações
em variáveis no `:root`; nunca `transition: all`, nunca `scale(0)`, nunca `ease-in`;
hover só dentro de `@media (hover: hover) and (pointer: fine)`; ações de teclado
(Enter/Espaço, Esc, foco por Tab) não animam.

| Componente | O que foi aplicado |
| --- | --- |
| Botões e clicáveis | `scale(0.97)` no `:active` em 160ms `--ease-out`; o hover anima a opacidade de um overlay, não a cor de fundo. |
| Menu mobile | Entra em 240ms e sai em 160ms (saída mais rápida), `opacity` + `translateY(-6px) scale(0.98)`, `transform-origin: top right` (perto do botão). O ícone vira "X" com `--ease-in-out`, porque é um morph na tela. |
| Cards de modalidades | Stagger de 60ms entre itens, 300ms `--ease-out`, disparado por IntersectionObserver uma única vez; não bloqueia a interação. A sombra do hover fica num pseudo-elemento e anima só `opacity`. |
| Bloco "Estrutura" | Revelação com `clip-path: inset(0 0 100% 0)` → `inset(0 0 0 0)` ao entrar na tela (`rootMargin: -100px`). Como é peça de marketing, pode durar mais (900ms). É a única propriedade fora de transform/opacity, e a skill recomenda esse uso. |
| Tooltips | 500ms de delay no primeiro, para evitar abertura acidental; os seguintes abrem na hora, sem animação (`data-instant`). Entram em 125ms com `scale(0.97)` a partir do ícone. |
| Popover de horários | 180ms na entrada e 120ms na saída; o `--transform-origin` é calculado em JS a partir do centro do gatilho. |
| Modal | 260ms na entrada e 180ms na saída, `transform-origin: center` (a skill isenta modais da regra de origem). Fecha com Esc na hora, sem animação. |
| Tela de sucesso | Fade de opacidade com `@starting-style`. |
| Movimento reduzido | Em `prefers-reduced-motion` todo deslocamento e escala é removido, e o reveal vira um fade. Ficam só as transições de opacidade: menos movimento, não zero. |
| Robustez | Sem JS, todo o conteúdo fica visível (os estados iniciais só valem com `.js`). Uma regra global `[hidden]` garante que o `display` de um componente não vença o atributo `hidden`. |
