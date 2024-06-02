const createEmailTemplate = ({ imgSrc, title, price, location, postUrl }) => `
<html>
  <head>
    <title></title>
  </head>
  <body>
    <!-- Start of Image Section -->
    <div style="text-align:center; margin:20px;">
      <img src="${imgSrc}" title="${title}" alt="${title}" style="max-width:100%; height:auto;">
      <p>Title: ${title}</p>
      <p>Price: ${price}</p>
      <p>Location: ${location}</p>
      
      <a href="${postUrl}" target="_blank" style="font-family:sans-serif;text-decoration:none;">
         View Post
      </a>
    </div>
    <!-- End of Image Section -->

    <div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5">
      <p style="font-size:12px; line-height:20px;">
        
      </p>
    </div>
  </body>
</html>
`;

export default createEmailTemplate;
