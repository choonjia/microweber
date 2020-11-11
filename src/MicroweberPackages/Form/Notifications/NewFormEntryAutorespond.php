<?php

namespace MicroweberPackages\Form\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use MicroweberPackages\Notification\Channels\AppMailChannel;
use MicroweberPackages\Option\Facades\Option;


class NewFormEntryAutorespond extends Notification
{
    use Queueable;
    use InteractsWithQueue, SerializesModels;

    public $notification;
    public $formEntry;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($formEntry = false)
    {
        $this->formEntry = $formEntry;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['database', AppMailChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $mail = new MailMessage();

        $emailAutorespond = Option::getValue('email_autorespond', 'email');
        if ($emailAutorespond) {
            $emailAutorespond = _e('Thank you!', true);
        }

        $emailAutorespondSubject = Option::getValue('email_autorespond_subject', 'email');
        if ($emailAutorespondSubject) {
            $emailAutorespondSubject = _e('Thank you for your message.', true);
        }

        $mail->line($emailAutorespondSubject);

        $loader = new \Twig\Loader\ArrayLoader([
            'mailAutoRespond' => $emailAutorespond,
        ]);
        $twig = new \Twig\Environment($loader);
        $parsedEmail = $twig->render('mailAutoRespond', [
                'url' => url('/'),
                'created_at' => date('Y-m-d H:i:s')
            ]
        );
        $mail->subject($emailAutorespondSubject);
        $mail->view('app::email.simple', ['content' => $parsedEmail]);

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return $this->formEntry;
    }

    public function setNotification($noification)
    {
        $this->notification = $noification;
    }

    public function message()
    {
        $toView = $this->notification->data;


        $toView['ago'] = app()->format->ago($this->notification->data['created_at']);

        return view('form::admin.notifications.new_form_entry', $toView);
    }

}
