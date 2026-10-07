import { FaGithub } from 'react-icons/fa';

type GithubLinkProps = {
  href: string;
  label: string;
};

export function GithubLink({ href, label }: GithubLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      <FaGithub size={32} />
    </a>
  );
}