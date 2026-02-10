document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const newFile = document.getElementById('newFile').files[0];
  const oldFile = document.getElementById('oldFile').files[0];

  if (!newFile || !oldFile) {
    alert("Veuillez sélectionner les deux fichiers.");
    return;
  }

  const newEmails = await parseCSV(newFile);
  const oldEmails = await parseCSV(oldFile);

  const cleanedNew = cleanEmails(newEmails);
  const cleanedOld = cleanEmails(oldEmails);

  const { optin, optout } = compareLists(cleanedNew, cleanedOld);
  downloadCSV(optin, 'optin');
  downloadCSV(optout, 'optout');
});

function parseCSV(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split('\n').slice(1); // Ignore header
      resolve(lines.map(line => line.trim()));
    };
    reader.readAsText(file);
  });
}

function cleanEmails(emails) {
  const allowedDomains = ['@cactus.lu', '@caterman.lu', '@belle-etoile.lu', '@schnekert.lu', '@createam.lu'];
  return emails
    .map(email => email.toLowerCase().trim())
    .filter(email => allowedDomains.some(domain => email.endsWith(domain)));
}


function compareLists(newEmails, oldEmails) {
  const oldSet = new Set(oldEmails);
  const newSet = new Set(newEmails);

  const optin = newEmails.filter(email => !oldSet.has(email));
  const optout = oldEmails.filter(email => !newSet.has(email));

  return {
    optin: [
      ['Email Address', 'Profile'],
      ...optin.map(email => [email, 'employee'])
    ],
    optout: [
      ['Email Address'],
      ...optout.map(email => [email])
    ]
  };
}

function downloadCSV(data, type) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '');
  const filename = `import_${type}_${timestamp}.csv`;
  const csv = data.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  document.getElementById('result').innerHTML += `<p>Fichier généré : ${filename}</p>`;
}
