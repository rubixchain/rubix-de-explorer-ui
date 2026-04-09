import React from 'react';

interface BanterLoaderProps {
  /** 'page' = full-screen overlay, 'section' = centered inside a content area */
  size?: 'page' | 'section';
  label?: string;
  sublabel?: string;
}

const CSS = `
  .bl-box {
    float: left; position: relative; width: 20px; height: 20px; margin-right: 6px;
  }
  .bl-box::before {
    content: ""; position: absolute; left: 0; top: 0;
    width: 100%; height: 100%; background: #facc15;
  }
  .bl-box:nth-child(3n)   { margin-right: 0; margin-bottom: 6px; }
  .bl-box:nth-child(1)::before,
  .bl-box:nth-child(4)::before { margin-left: 26px; }
  .bl-box:nth-child(3)::before { margin-top: 52px; }
  .bl-box:last-child { margin-bottom: 0; }
  .bl-box:nth-child(1) { animation: blBox1 4s infinite; }
  .bl-box:nth-child(2) { animation: blBox2 4s infinite; }
  .bl-box:nth-child(3) { animation: blBox3 4s infinite; }
  .bl-box:nth-child(4) { animation: blBox4 4s infinite; }
  .bl-box:nth-child(5) { animation: blBox5 4s infinite; }
  .bl-box:nth-child(6) { animation: blBox6 4s infinite; }
  .bl-box:nth-child(7) { animation: blBox7 4s infinite; }
  .bl-box:nth-child(8) { animation: blBox8 4s infinite; }
  .bl-box:nth-child(9) { animation: blBox9 4s infinite; }
  @keyframes blBox1 {
    9.09%{transform:translate(-26px,0)} 18.18%{transform:translate(0,0)} 27.27%{transform:translate(0,0)}
    36.36%{transform:translate(26px,0)} 45.45%{transform:translate(26px,26px)} 54.55%{transform:translate(26px,26px)}
    63.64%{transform:translate(26px,26px)} 72.73%{transform:translate(26px,0)} 81.82%{transform:translate(0,0)}
    90.91%{transform:translate(-26px,0)} 100%{transform:translate(0,0)}
  }
  @keyframes blBox2 {
    9.09%{transform:translate(0,0)} 18.18%{transform:translate(26px,0)} 27.27%{transform:translate(0,0)}
    36.36%{transform:translate(26px,0)} 45.45%{transform:translate(26px,26px)} 54.55%{transform:translate(26px,26px)}
    63.64%{transform:translate(26px,26px)} 72.73%{transform:translate(26px,26px)} 81.82%{transform:translate(0,26px)}
    90.91%{transform:translate(0,26px)} 100%{transform:translate(0,0)}
  }
  @keyframes blBox3 {
    9.09%{transform:translate(-26px,0)} 18.18%{transform:translate(-26px,0)} 27.27%{transform:translate(0,0)}
    36.36%{transform:translate(-26px,0)} 45.45%{transform:translate(-26px,0)} 54.55%{transform:translate(-26px,0)}
    63.64%{transform:translate(-26px,0)} 72.73%{transform:translate(-26px,0)} 81.82%{transform:translate(-26px,-26px)}
    90.91%{transform:translate(0,-26px)} 100%{transform:translate(0,0)}
  }
  @keyframes blBox4 {
    9.09%{transform:translate(-26px,0)} 18.18%{transform:translate(-26px,0)} 27.27%{transform:translate(-26px,-26px)}
    36.36%{transform:translate(0,-26px)} 45.45%{transform:translate(0,0)} 54.55%{transform:translate(0,-26px)}
    63.64%{transform:translate(0,-26px)} 72.73%{transform:translate(0,-26px)} 81.82%{transform:translate(-26px,-26px)}
    90.91%{transform:translate(-26px,0)} 100%{transform:translate(0,0)}
  }
  @keyframes blBox5 {
    9.09%{transform:translate(0,0)} 18.18%{transform:translate(0,0)} 27.27%{transform:translate(0,0)}
    36.36%{transform:translate(26px,0)} 45.45%{transform:translate(26px,0)} 54.55%{transform:translate(26px,0)}
    63.64%{transform:translate(26px,0)} 72.73%{transform:translate(26px,0)} 81.82%{transform:translate(26px,-26px)}
    90.91%{transform:translate(0,-26px)} 100%{transform:translate(0,0)}
  }
  @keyframes blBox6 {
    9.09%{transform:translate(0,0)} 18.18%{transform:translate(-26px,0)} 27.27%{transform:translate(-26px,0)}
    36.36%{transform:translate(0,0)} 45.45%{transform:translate(0,0)} 54.55%{transform:translate(0,0)}
    63.64%{transform:translate(0,0)} 72.73%{transform:translate(0,26px)} 81.82%{transform:translate(-26px,26px)}
    90.91%{transform:translate(-26px,0)} 100%{transform:translate(0,0)}
  }
  @keyframes blBox7 {
    9.09%{transform:translate(26px,0)} 18.18%{transform:translate(26px,0)} 27.27%{transform:translate(26px,0)}
    36.36%{transform:translate(0,0)} 45.45%{transform:translate(0,-26px)} 54.55%{transform:translate(26px,-26px)}
    63.64%{transform:translate(0,-26px)} 72.73%{transform:translate(0,-26px)} 81.82%{transform:translate(0,0)}
    90.91%{transform:translate(26px,0)} 100%{transform:translate(0,0)}
  }
  @keyframes blBox8 {
    9.09%{transform:translate(0,0)} 18.18%{transform:translate(-26px,0)} 27.27%{transform:translate(-26px,-26px)}
    36.36%{transform:translate(0,-26px)} 45.45%{transform:translate(0,-26px)} 54.55%{transform:translate(0,-26px)}
    63.64%{transform:translate(0,-26px)} 72.73%{transform:translate(0,-26px)} 81.82%{transform:translate(26px,-26px)}
    90.91%{transform:translate(26px,0)} 100%{transform:translate(0,0)}
  }
  @keyframes blBox9 {
    9.09%{transform:translate(-26px,0)} 18.18%{transform:translate(-26px,0)} 27.27%{transform:translate(0,0)}
    36.36%{transform:translate(-26px,0)} 45.45%{transform:translate(0,0)} 54.55%{transform:translate(0,0)}
    63.64%{transform:translate(-26px,0)} 72.73%{transform:translate(-26px,0)} 81.82%{transform:translate(-52px,0)}
    90.91%{transform:translate(-26px,0)} 100%{transform:translate(0,0)}
  }
`;

export const BanterLoader: React.FC<BanterLoaderProps> = ({
  size = 'section',
  label = 'Loading',
  sublabel,
}) => {
  const isPage = size === 'page';

  const wrapperClass = isPage
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white'
    : 'flex flex-col items-center justify-center py-12 w-full';

  return (
    <div className={wrapperClass}>
      <style>{CSS}</style>
      <div style={{ position: 'relative', width: 72, height: 72, marginBottom: 24 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bl-box" />
        ))}
      </div>
      <p style={{ color: '#000', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'inherit', margin: 0 }}>
        {label}
      </p>
      {sublabel && (
        <p style={{ color: '#000', fontSize: 10, marginTop: 6, opacity: 0.45, fontFamily: 'inherit', margin: '6px 0 0' }}>
          {sublabel}
        </p>
      )}
    </div>
  );
};
