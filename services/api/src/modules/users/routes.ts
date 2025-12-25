import { Elysia, t } from 'elysia';
import { User } from '../../models';

export const usersModule = new Elysia({ prefix: '/users' })

    // Get user profile
    .get('/:id', async ({ params }) => {
        const user = await User.findById(params.id).select('-__v');

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        return {
            success: true,
            data: user
        };
    })

    // Update user profile
    .patch('/:id', async ({ params, body }) => {
        const user = await User.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true }
        ).select('-__v');

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        return {
            success: true,
            message: 'Profile updated successfully',
            data: user
        };
    }, {
        body: t.Object({
            name: t.Optional(t.String()),
            email: t.Optional(t.String({ format: 'email' })),
            avatar: t.Optional(t.String()),
            role: t.Optional(t.Union([
                t.Literal('patient'),
                t.Literal('doctor')
            ]))
        })
    })

    // Set user role (after role selection screen)
    .post('/:id/role', async ({ params, body }) => {
        const user = await User.findByIdAndUpdate(
            params.id,
            { role: body.role },
            { new: true }
        );

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        return {
            success: true,
            message: `Role set to ${body.role}`,
            data: { role: user.role }
        };
    }, {
        body: t.Object({
            role: t.Union([t.Literal('patient'), t.Literal('doctor')])
        })
    });
