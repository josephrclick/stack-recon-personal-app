export const coverLetterTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&family=Courgette&display=swap" rel="stylesheet">

  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&family=Courgette&display=swap');

    @page {
      margin: 1in;
      size: letter;
    }

    
    body {
      font-family: 'EB Garamond', serif;
      font-size: 12pt;
      line-height: 1.5;
      margin: 0;
      color: rgb(0, 0, 0);
    }
    
    .header-section {
      text-align: center;
      margin-bottom: 0.2in;
    }
          
    .header-name {
      font-family: 'EB Garamond', serif;
      font-weight: 700;
      font-size: 20pt; 
      line-height: 1.2;
      margin-bottom: 0.2in;
      transform: scale(1.2); 
    }

    .contact-info {
      font-family: 'EB Garamond', serif;
      font-weight: 400;
      font-size: 14pt; 
      line-height: 1.3;
      transform: scale(0.9); 
    }
        
    .contact-info a {
      color: rgb(5, 99, 193);
      text-decoration: underline;
    }
    
    .date {
      margin: 0.3in 0 0.15in 0;
    }
    
    .company {
      text-transform: uppercase;
      margin-bottom: 0.15in;
    }
    
    .job-reference {
      margin-bottom: 0.3in;
    }
    
    .letter-body {
      margin-bottom: 0.5in;
    }
    
    .signature-block {
      margin-top: 0.5in;
    }
    
    .signature-yours {
      font-family: 'EB Garamond', serif;
      font-size: 12pt;
      margin-bottom: 0.1in;
    }
    
    .signature-script {
      font-family: 'Courgette', cursive;
      font-size: 20pt;
      margin-bottom: 0.1in;
    }
    
    .signature-typed {
      font-family: 'EB Garamond', serif;
      font-size: 12pt;
    }
    
    p {
      margin: 0 0 1em 0;
    }
  </style>
</head>
<body>
  <div class="header-section">
    <div class="header-name">
      Joseph R. Click
    </div>
    <div class="contact-info">
      (858) 366-8097 | 
      <a href="mailto:JosephRClick@gmail.com">JosephRClick@gmail.com</a> | 
      <a href="https://www.linkedin.com/in/josephclick/">linkedin.com/in/josephclick/</a>
    </div>
  </div>

  <div class="date">
    {{date}}
  </div>

  <div class="company">
    {{companyName}}
  </div>

  <div class="job-reference">
    Re: {{jobTitle}} role
  </div>

  <div class="letter-body">
    <p>Dear Hiring Team,</p>
    <p>I’m a Sales Engineer who builds things. I build tools, demo environments, APIs, systems, relationships, and trust. I’ve found my home in presales because it’s the rare space where technical depth meets business impact and where the best solutions come from listening closely, understanding the pain, and building something that actually solves it.</p>
    <p>At Contentsquare, I’ve led Proof of Concept projects end-to-end, crafted bespoke demo environments, and written plenty of Python, JavaScript, and SQL to make sure every stakeholder sees the value of our solutions clearly. I’ve also built internal tooling and automations that save my team hours every week, because I know great Sales Engineers scale the entire org, not just their own deals.</p>
    <p>What draws me to {{companyName}} is your focus on secure, scalable solutions and the kind of technical complexity that makes the job interesting. I thrive in environments where I can get close to the product, close to the customer, and close to the truth about what really drives decisions. If there’s room on your team for someone who loves solving hard problems and making things better, I’d love to connect.</p>
  </div>

  <div class="signature-block">
    <div class="signature-yours">
      Best regards,
    </div>
    <div class="signature-script">
      Joseph R. Click
    </div>
    <div class="signature-typed">
      Joseph R. Click
    </div>
  </div>
</body>
</html>
`;