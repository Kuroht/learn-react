import { GithubLink } from './GithubLink';

export function Header() {
  return (
    <header>
      <GithubLink href="https://github.com/kuroht" label="Nathan on GitHub" />
      <h1>Nathan</h1>
      <p>Fullstack Web Developer</p>
    </header>
  );
}