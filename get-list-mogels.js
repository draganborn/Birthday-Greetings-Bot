const axios = require('axios');
const https = require('https');
const fs = require('fs');
const rootCA = fs.readFileSync('/etc/ca-certificates/trust-source/anchors/russian_trusted_root_ca_pem.crt');
const subCA = fs.readFileSync('/etc/ca-certificates/trust-source/anchors/russian_trusted_sub_ca_pem.crt');
const agent = new https.Agent({ ca: [rootCA, subCA] });

let config = {
  method: 'get',
maxBodyLength: Infinity,
  url: 'https://gigachat-preview.devices.sberbank.ru/api/v1/models',
  headers: { 
    'Accept': 'application/json', 
    'Authorization': 'Bearer eyJjdHkiOiJqd3QiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.u0c2evTJmez8dtWDHVQlF6rJGcsWWN67SjudHHGWWN9FVYcJqt5HHRJbk3cEL7I_ihIgbEZJMWl01tjg-E2i4B5w7WhxcBnQDeeuse7nAxMKYM8z0w9VWNcLJP0C-HruhfE-k745Bib8uEgptneQdOVAVLlQEAqWeAdfM7ceVJAw8o_weasDlQ403Kvxpd2Z9Fny-E_k-67SQsnsTe32yKn6ymtTOPVUwfXikyAi_W3_GsJ5-HWUasZ0GZzpoJQUrfBSrco4ZdBG3vNRq0vR2F7cTHd0o1HI4wmp9JMizHYFwwtn0LXdDTHhDvKXGfhs9ufQ0XyGH3WfSwNgx_lNIw.1qBlXn-BbJQMc8GB1pejSg.52wxVnqskRnQdVAHB8NxAPddBS1MxvwGj0eGpRMhctNKmMIvmadn8jKp1fquFcyTnOhUmXVvZL9rHJt_yR5552R_OQNAPP1GJ6RSKjMrHwJXLUbX1-cJgD6flHnqBkKRBd6ZnVtCZ9ZlFrDdSx3lr1fKyE4x2CGn2GH_K67AqY3RaZt8mda7RJVNiF4xOvSCUMXNXWeYJdmB2HNbvUKMUbHZBfQFEQPvbase1PtzKrtCgMVg5ZwtI9nqo6fe7d6rV7KQvgRCdpsvVRJAgY0M4LWUyLDeeVZ690dhf66pqzuAD3ewDsytCoevr6ZWrBUdPxRdG31dIgSjUY4mpg1wIy0WlKPZDS7JwTcejDCYX2pGZDvaexFE5MFaxOasSeJlSzhC5osgZfZCU5Nn06E5CXI8UOolUVRW_ZvCwRCP_Inz1nXhs6PngZETSIvX052rVV1qzIAaBc3_c2GDFA9bWLqZSoM-Ezp8yIvuZfRId6N7G8Roy6nzzgQeWAIkkrDfH7uhtadn8oWC713ST5ElAXunLwG_ZyH326E3jU6x3FtXqe3Ej8wzz1MgTg6D6XsePdDzF6y-6RO1t3-BwcZ8ddNS4pnSGYuwoSbojWWwzWqPTSO_GG-5GeFZhPDnaUckQC9yD87J3dP5OjzeZVGDuT6RTxWuKHn9E40JCMDTUSZ-gLmYnwEdG6VjmjsROewyHljHAKJ2O2_guT_YyLAbof6kmJTFMiu6NS9dhDETwFA.5bAx7T6sGiiZqPqCkrOo1PhiRW-vjZFXH1My_NY7qGs'
  },
    httpsAgent: agent
};

axios(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
