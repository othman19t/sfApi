import Post from '../models/post.model.js';
import calculateDistance from '../utilities/calculateDistance.js';
import { sendNotificationEmail } from '../utilities/sendEmails.js';
export const getPosts = async (req, res) => {
  const userId = req?.user?.id;
  try {
    const pageSize = 20;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const skip = (page - 1) * pageSize;

    const posts = await Post.find({ userId })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });

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

export const getPostsByTaskId = async (req, res) => {
  const userId = req?.user?.id;
  try {
    const pageSize = 20;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const skip = (page - 1) * pageSize;

    const posts = await Post.find({ userId, taskId: req.query.taskId })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });

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
export const processInitialPosts = async (req, res) => {
  const { task, posts, firstTime } = req.body;
  const { radius, postalCode, email, userId } = req.body?.task;
  console.log('Processing initial posts', posts.length);

  let closePosts = [];
  try {
    // get existing posts to use it to get the noneisting posts
    const existingIds = (
      await Post.find({
        postId: { $in: posts.map((doc) => doc.postId) },
        userId,
      })
    ).map((doc) => doc.postId);

    // use the existing posts to get the non existing posts
    const nonexistingPosts = posts.filter(
      (doc) => !existingIds.includes(doc.postId)
    );
    console.log('nonexistingPosts.lenght', nonexistingPosts?.length);

    if (nonexistingPosts.length > 0) {
      const result = await Post.insertMany(nonexistingPosts, {
        ordered: false,
      });

      console.log('insert result', result);
      nonexistingPosts.forEach(async (post) => {
        if (calculateDistance(post.location, postalCode, radius)) {
          closePosts = [...closePosts, post];
        }
      });
      if (closePosts?.length > 0) {
        closePosts.forEach((post) => {
          console.log(
            `trying to send emails when close posts length is: ${closePosts?.length} `
          );
          if (!firstTime) {
            sendNotificationEmail({
              to: email,
              img_src: post?.imgSrc,
              title: post?.title,
              location: post?.location,
              post_url: post?.postUrl,
              price: post?.price,
            });
          }
        });
      }
      console.log('closePosts.length', closePosts.length);
      return res.status(200).json({
        success: true,
        message: 'posts received and processed successfully',
      });
    } else {
      console.log(
        `since nonexistingPosts.length is ${nonexistingPosts.length} 200 response code sent to event-buzz`
      );
      return res.status(200).json({
        success: true,
        message: 'posts received and processed successfully',
      });
    }
  } catch (error) {
    console.error('Error in receiveInitakPosts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
  console.log('req.body', req.body);
};
