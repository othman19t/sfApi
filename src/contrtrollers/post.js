import Post from '../models/post.model.js';
export const getPosts = async (req, res) => {
  //TODO: update the code accordingly once other ports are ready
  try {
    const userId = '65c42628634a0830211559f8'; //req.user.id; //TODO: keep using this userId till we finish other features and we will have new posts for new users
    const pageSize = 20; // Number of posts to retrieve per page
    const page = 1; //req.query.page ? parseInt(req.query.page) : 1;//TODO: update the code accordingly once other ports are ready
    const skip = 0; // (page - 1) * pageSize;// TODO: update the code accordingly once other ports are ready
    const posts = await Post.find({ userId })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    console.log('posts: ' + posts);
    return res.status(200).send({
      message: 'successfully retrieved posts',
      success: true,
      posts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: 'server error occurred',
      success: false,
    });
  }
};
