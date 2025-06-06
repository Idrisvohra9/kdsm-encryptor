export function InitialsAvatar({ user, size = 64 }) {
  const getUserInitials = (user) => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const initials = getUserInitials(user);

  return (
    <div 
      className="flex items-center justify-center rounded-full bg-gray-500 text-white font-medium"
      style={{ 
        width: size, 
        height: size, 
        fontSize: size * 0.4 
      }}
    >
      {initials}
    </div>
  );
}