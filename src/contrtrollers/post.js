import Post from '../models/post.model.js';
import calculateDistance from '../utilities/calculateDistance.js';
import { sendEmail } from '../utilities/sendEmails.js';
import { handleCreateNotification } from '../api/notifications.js';
export const getPosts = async (req, res) => {
  const userId = req?.user?.id;
  try {
    const pageSize = 20;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const skip = (page - 1) * pageSize;
    console.log('skip: ' + skip);
    console.log('limit: ' + pageSize);

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

export const getPostsByIds = async (req, res) => {
  try {
    const ids = req.body.ids;
    const posts = await Post.find({ postId: { $in: ids } }).sort({
      createdAt: -1,
    });
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
  const { posts, firstTime } = req.body;
  const {
    radius,
    postalCode,
    email,
    userId,
    sendNotificationEmail,
    _id: taskId,
  } = req.body?.task;
  console.log('Processing initial posts', posts.length);
  let notifications = [];

  let closePosts = [];
  try {
    const existingIds = (
      await Post.find({
        postId: { $in: posts.map((doc) => doc.postId) },
        userId,
      })
    ).map((doc) => doc.postId);

    const nonexistingPosts = posts.filter(
      (doc) => !existingIds.includes(doc.postId)
    );

    console.log('nonexistingPosts.length', nonexistingPosts?.length);

    if (nonexistingPosts.length > 0) {
      const result = await Post.insertMany(nonexistingPosts, {
        ordered: false,
      });

      for (const post of nonexistingPosts) {
        if (await calculateDistance(post.location, postalCode, radius)) {
          closePosts.push(post);
        }
      }

      if (closePosts.length > 0) {
        for (const post of closePosts) {
          if (!firstTime) {
            notifications.push({
              postId: post.postId,
              userId,
              taskId,
              status: 'unread',
            });
            if (sendNotificationEmail) {
              // sendEmail({
              //   to: email,
              //   img_src: post.imgSrc,
              //   title: post.title,
              //   location: post.location,
              //   post_url: post.postUrl,
              //   price: post.price,
              // });
            }
          }
        }
      }

      if (notifications.length > 0) {
        handleCreateNotification(notifications);
      } else {
        console.log('No notifications to send');
      }

      console.log('closePosts.length', closePosts.length);
      res.status(200).json({
        success: true,
        message: 'Posts received and processed successfully',
      });
    } else {
      console.log(
        `Since nonexistingPosts.length is ${nonexistingPosts.length}, 200 response code sent`
      );
      res.status(200).json({
        success: true,
        message: 'Posts received and processed successfully',
      });
    }
  } catch (error) {
    console.error('Error in processing initial posts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
