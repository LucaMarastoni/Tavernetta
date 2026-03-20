import { Link } from 'react-router-dom';

function Button({
  href,
  to,
  children,
  variant = 'primary',
  size = 'default',
  className = '',
  target,
  rel,
  onClick,
}) {
  const classes = ['button', `button-${variant}`, `button-${size}`, className]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link className={classes} to={to} onClick={onClick} viewTransition>
        <span>{children}</span>
      </Link>
    );
  }

  if (href) {
    return (
      <a className={classes} href={href} target={target} rel={rel} onClick={onClick}>
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button className={classes} type="button" onClick={onClick}>
      <span>{children}</span>
    </button>
  );
}

export default Button;
