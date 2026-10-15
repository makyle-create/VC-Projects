const KEY = 'volunteer-connect:saved-opportunities';

export function getSavedOpportunities() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function announce() {
  window.dispatchEvent(new CustomEvent('saved-opportunities-changed'));
}

export function isOpportunitySaved(id) {
  return getSavedOpportunities().some((item) => String(item.id) === String(id));
}

export function toggleSavedOpportunity(opportunity) {
  const saved = getSavedOpportunities();
  const exists = saved.some((item) => String(item.id) === String(opportunity.id));
  const next = exists
    ? saved.filter((item) => String(item.id) !== String(opportunity.id))
    : [opportunity, ...saved.filter((item) => String(item.id) !== String(opportunity.id))];
  localStorage.setItem(KEY, JSON.stringify(next));
  announce();
  return !exists;
}
