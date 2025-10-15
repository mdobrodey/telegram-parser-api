export default function cleanUsername(username) {
  if (
    !username ||
    typeof username != 'string' ||
    username.length < 5 ||
    username.length > 40
  )
    return null;

  const cleanedUsername = username.replace(/^@/, '').trim();
  if (!/^[a-zA-Z0-9_+]+$/.test(cleanedUsername.split('/')[0])) {
    return null;
  }

  return cleanedUsername;
}
