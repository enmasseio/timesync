export function post (url, body, timeout) {
  return new Promise((resolve, reject) => {
    return Promise.race([
      fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          redirect: 'follow',
          body: JSON.stringify(body),
      }).then((response)=> {
          return response.json().then((respJson)=> {
              return resolve([respJson, response.status]);
          });
      }).catch((err)=> { return reject(err); }),
      new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeout)
      )
    ]);
  });
}