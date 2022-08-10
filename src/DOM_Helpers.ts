// navigate the DOM using path notation
// .. -> parent
// +  -> next sibling
// .class -> all children with a class
// tag -> all children of a certain tag
// divided by /
export function navigateDOM(positions: HTMLElement[], path: string, strict: boolean = false): HTMLElement[] {
  if (positions.length === 0) return [];
  const steps = path.split('/');
  const currStep = steps.shift() as string;
  if (currStep == '') return positions;
  const restSteps = steps.join('/');

  let newPositions = [];
  if (currStep == '..') {
    // navigate up
    newPositions = positions.map(p => p.parentElement).filter(p => p);
  } else if (currStep == '+') {
    // navigate sideways
    newPositions = positions.map(p => p.nextElementSibling).filter(p => p);
  } else if (currStep.startsWith('.')) {
    // navigate down + filter for class
    const className = currStep.slice(1);
    newPositions = positions.flatMap(p => Array.from(p.children).filter(c => c.classList.contains(className)));
  } else {
    // navigate down + filter for tag
    newPositions = positions.flatMap(p => Array.from(p.children).filter(c => c.tagName == currStep.toUpperCase()));
  }
  if (newPositions.length === 0 && strict) {
    console.error(`Error traversing ${path}: No element found`);
  }
  return navigateDOM(newPositions as HTMLElement[], restSteps);
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
