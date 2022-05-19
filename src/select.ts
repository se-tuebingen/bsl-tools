function makeTextSelectable(container: HTMLElement) {
  const text = container.innerHTML;
  // divide up into spans
  container.innerHTML = text.split('').map(c =>
    `<span>${c}</span>`
  ).join('');

  // register if mouse is pressed
  container.onmousedown = () => {
    container.setAttribute('data-selecting', 'true');
    Array.from(container.children).map(c => c.removeAttribute('data-selected'));
  };
  container.onmouseup = () => {
    container.removeAttribute('data-selecting');
  };
  container.onmouseleave = () => {
    container.removeAttribute('data-selecting');
  };

  // select on mouse over
  Array.from(container.children).map(c => {
    const ch = c as HTMLElement;
    ch.onmouseenter = () => {
      if (ch.parentElement?.getAttribute('data-selecting')) {
        c.setAttribute('data-selected', 'true');
      }
    };
  });
}
