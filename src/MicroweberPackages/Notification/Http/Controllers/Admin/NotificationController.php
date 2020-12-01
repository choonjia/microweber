<?php
/**
 * Created by PhpStorm.
 * User: Bojidar
 * Date: 11/10/2020
 * Time: 4:49 PM
 */

namespace MicroweberPackages\Notification\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use MicroweberPackages\App\Http\Controllers\AdminController;
use MicroweberPackages\Notification\Models\Notification;
use MicroweberPackages\User\Models\User;

class NotificationController extends AdminController
{
    public function index(Request $request)
    {

        $readyNotifications = [];

        $admin = Auth::user();

        $notifications = Notification::filter($request->all())
            ->where('notifiable_id', $admin->id)
            ->where('id', '>', 0)
            ->paginate($request->get('limit', 3))
            ->appends($request->except('page'));

        foreach ($notifications as $notification) {

            if (!class_exists($notification->type)) {
                continue;
            }


            $messageType = new $notification->type();

            if (method_exists($messageType, 'setNotification')) {
                $messageType->setNotification($notification);
            }

            if (!method_exists($messageType, 'message')) {
                continue;
            }

            $icon = '<i class="mdi mdi-email-check"></i>';
            if (method_exists($messageType, 'icon')) {
                $icon = $messageType->icon();
            }

            $read = false;
            if ($notification->read_at) {

            }

            $readyNotifications[] = [
                'id' => $notification->id,
                'read' => $read,
                'icon' => $icon,
                'message' => $messageType->message()
            ];
        }


        return $this->view('notification::notifications.index', [
            'is_quick' => 1,
            'type' => $request->get('type'),
            'notifications_model' => $notifications,
            'notifications' => $readyNotifications
        ]);
    }

    public function read(Request $request)
    {
        $ids = $request->post('ids');

        $admin = Auth::user();

        foreach ($ids as $id) {
            $notify = Notification::where('notifiable_id', $admin->id)->where('id', $id)->first();
            $notify->read_at = date('Y-m-d H:i:s');
            $notify->save();
        }

    }

    public function reset(Request $request)
    {
        $ids = $request->post('ids');

        $admin = Auth::user();

        if (empty($ids)) {
            Notification::where('notifiable_id', $admin->id)->update(['read_at' => '']);
        }

        foreach ($ids as $id) {
            $notify = Notification::where('id', $id)->first();
            $notify->read_at = '';
            $notify->save();
        }
    }

    public function delete(Request $request)
    {
        $ids = $request->post('ids');

        $admin = Auth::user();

        foreach ($ids as $id) {
            Notification::where('notifiable_id', $admin->id)->where('id', $id)->delete();
        }
    }
}