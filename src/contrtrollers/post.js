import Post from '../models/post.model.js';
export const getPosts = async (req, res) => {
  //TODO: update the code accordingly once other ports are ready
  try {
    const userId = req.user.id;
    const posts = await Post.find({ userId });

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
