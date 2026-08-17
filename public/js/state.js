export let currentUser = null;


// ======================================================
// CURRENT USER
// ======================================================

export function setCurrentUser(user) {
  currentUser = user;
}


// ======================================================
// PERMISSIONS
// ======================================================

export function hasPermission(permission) {

  if (!currentUser) {
    return false;
  }

  const permissions =
    Array.isArray(currentUser.permissions)
      ? currentUser.permissions
      : [];

  if (
    permissions.includes("*")
  ) {
    return true;
  }

  return permissions.includes(
    permission
  );
}


// ======================================================
// TODAY — KYIV
// YYYY-MM-DD
// ======================================================

export function today() {

  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Europe/Kyiv",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    )
      .formatToParts(
        new Date()
      );

  const year =
    parts.find(
      (part) =>
        part.type === "year"
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type === "month"
    )?.value;

  const day =
    parts.find(
      (part) =>
        part.type === "day"
    )?.value;

  return `${year}-${month}-${day}`;
}


// ======================================================
// ESCAPE HTML
// ======================================================

export function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


// ======================================================
// FORMAT DATE
//
// 2026-08-16
// ->
// 16.08.2026
// ======================================================

export function formatDate(value) {

  const parts =
    String(
      value || ""
    ).split("-");

  if (
    parts.length !== 3
  ) {
    return String(
      value || ""
    );
  }

  return (
    `${parts[2]}.` +
    `${parts[1]}.` +
    `${parts[0]}`
  );
}