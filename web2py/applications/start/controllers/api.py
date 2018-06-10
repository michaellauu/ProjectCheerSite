import tempfile

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

@auth.requires_signature()
def add_image():
    img_id = db.user_images.insert(image_url = request.vars.image_url)
    i = db.user_images(img_id)
    return response.json(dict(image_data = dict(
        id = i.id,
        created_on = i.created_on,
        created_by = i.created_by,
        image_url = i.image_url,
        upvotes = i.upvotes,
        downvotes = i.downvotes,
    )))

def get_images():
    current_id = int(request.vars.current_id) if request.vars.current_id is not None else 0
    images = []
    ratings = []
    rate = db().select(db.ratings.ALL)
    img = db().select(db.user_images.ALL)
    for i in rate:
        if i.user_id == current_id:
            ra = dict (
                id = i.user_id,
                image_id = i.image_id,
                favorited = i.favorited,
                upvote = i.upvote,
                downvote = i.downvote
            )
            ratings.append(ra)
    for r in img:
        if r.created_by == current_id:
            t = dict(
                id = r.id,
                created_on = r.created_on,
                created_by = r.created_by,
                image_url = r.image_url,
                upvotes= r.upvotes,
                downvotes=r.downvotes,
            )
            images.append(t)
    if (auth.user_id is not None):
        user_id = auth.user_id
    else:
        user_id = 0
    return response.json(dict(
        images = images,
        ratings = ratings,
        user_id = user_id,
    ))

def get_user():
    users = []
    u = db(db.auth_user.id > 0).select()
    if auth.is_logged_in():
        cuser = dict(
            id = auth.user.id,
            first_name = auth.user.first_name,
            last_name = auth.user.last_name
        )
        users.append(cuser)
    for i in u:
        if (i.id != auth.user_id):
            ouser = dict(
                id = i.id,
                first_name = i.first_name,
                last_name = i.last_name
            )
            users.append(ouser)
    if (auth.user_id is not None):
        user_id = auth.user_id
    else:
        user_id = 0
    return response.json(dict(
        users = users,
        user_id = user_id,
    ))

@auth.requires_signature()
def del_image():
    db(db.user_images.id == request.vars.id).delete()
    return "done"

@auth.requires_signature()
def toggle_favorite():
    q = db.ratings(request.vars.image_id)
    q.update_record(favorited = not q.favorited)
    return "done"

@auth.requires_signature()
def add_favorite():
    img_id = db.ratings.insert(user_id = request.vars.user_id, image_id = request.vars.image_id, favorited = True)
    i = db.ratings(img_id)
    return response.json(dict(image_data = dict(
        id = i.user_id,
        image_id = i.image_id,
        favorited = i.favorited,
        upvote = i.upvote,
        downvote = i.downvote
    )))

def get_ratings():
    current_id = int(request.vars.current_id) if request.vars.current_id is not None else 0
    ratings = []
    rate = db().select(db.ratings.ALL)
    for i in rate:
        if i.user_id == current_id:
            ra = dict (
                id = i.user_id,
                image_id = i.image_id,
                favorited = i.favorited,
                upvote = i.upvote,
                downvote = i.downvote
            )
            ratings.append(ra)
    if (auth.user_id is not None):
        user_id = auth.user_id
    else:
        user_id = 0
    return response.json(dict(
        ratings = ratings,
        user_id = user_id,
    ))
# Here go your api methods.


