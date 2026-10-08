   export function Main() {
    const ideas = ['A to-do app', 'A weather app', 'A portfolio site'];

     return (
       <>
            <p>Hello my name is Nathan, i am a fullstack web developer.</p>

            <ul>
                {ideas.map((idea) => (
                    <li key={idea}>{idea}</li>
                ))}
            </ul>
       </>
     );
   }