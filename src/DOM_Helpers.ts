// navigate the DOM using path notation
// .. -> parent
// +  -> next sibling
// .class -> all children with a class
// tag -> all children of a certain tag
// divided by /
export function navigateDOM(positions: HTMLElement[], path: string): HTMLElement[] {
  const steps = path.split('/');
  const currStep = steps.shift() as string;
  if (currStep == '') return positions;
  const restSteps = steps.join('/');

  if (currStep == '..') {
    // navigate up
    const newPositions = positions.map(p => p.parentElement);
    if (newPositions.every(p => p)) {
      return navigateDOM(newPositions as HTMLElement[], restSteps);
    } else {
      console.error(`Error traversing ${path}: Missing parentElement`, positions);
      return [];
    }
  } else if (currStep == '+') {
    // navigate sideways
    const newPositions = positions.map(p => p.nextElementSibling);
    if (newPositions.every(p => p)) {
      return navigateDOM(newPositions as HTMLElement[], restSteps);
    } else {
      console.error(`Error traversing ${path}: Missing nextElementSibling`, positions);
      return [];
    }
  } else if (currStep.startsWith('.')) {
    // navigate down + filter for class
    const className = currStep.slice(1);
    const newPositions = positions.flatMap(p => Array.from(p.children).filter(c => c.classList.contains(className)));
    return navigateDOM(newPositions as HTMLElement[], restSteps);
  } else {
    // navigate down + filter for tag
    const newPositions = positions.flatMap(p => Array.from(p.children).filter(c => c.tagName == currStep.toUpperCase()));
    return navigateDOM(newPositions as HTMLElement[], restSteps);
  }
}

// getParentTagRecursive from a child element
// if element has TagName
// return;
// else: retry with parentElement
export function getParentTagRecursive(el: HTMLElement, tag: string): HTMLElement | null {
  if (el.tagName == tag.toUpperCase()) {
    return el;
  }
  else {
    let parent = el.parentElement;
    if (!parent) {
      console.error('Could not find parent element with requested tag ', tag);
      return null;
    }
    return getParentTagRecursive(parent, tag) as HTMLElement;
  }
}

// getParentClassRecursive from a child element
// if element has class
// return;
// else: retry with parentElement
export function getParentClassRecursive(el: HTMLElement, c: string): HTMLElement | null {
  if (el.classList.contains(c)) {
    return el;
  }
  else {
    let parent = el.parentElement;
    if (!parent) {
      console.error('Could not find parent element with requested class ', c);
      return null;
    }
    return getParentClassRecursive(parent, c);
  }
}
