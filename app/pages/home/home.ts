import { Component } from '@angular/core';
import { NavController, Loading, Alert} from 'ionic-angular';
import { SocialSharing } from 'ionic-native';

import { StoriesService } from '../../providers/stories/stories';
import { CommentsPage } from '../../pages/comments/comments';
import { UnixDate } from '../../pipes/unixDate';

@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [StoriesService],
  pipes: [UnixDate]
})
export class HomePage {

  stories: any[];
  storyIDs: any;
  previousIndex: number;
  storiesRetreived: any[];

  constructor(private nav: NavController,
    private storiesService: StoriesService) {
    this.stories = [];
  }

  ionViewDidEnter() {
    let loading = Loading.create({
      content: 'Getting Stories...',
    });

    this.nav.present(loading).then(() => {
      this.storiesService.getStories()
        .subscribe(
        (data: any) => {
          this.storyIDs = data;
          this.previousIndex = this.storyIDs.length - 20;
          for (let i = 0; i < 20; i++) {
            let id = data[i]
            this.storiesService.getStory(data[i])
              .subscribe(
              (data: any) => {
                this.stories.push({ data: data, id: id });
                loading.dismiss();
                this.storiesRetreived = this.stories;
                sessionStorage.setItem('loaded', 'true');
              }
              )
          }
        },
        (error: Error) => {
          console.log(error);
        }
        )
    })
  }

  private fillStories() {
    let loading = Loading.create({
      content: 'Getting Stories...',
    });
    this.nav.present(loading).then(() => {
      this.stories = [];
      this.storiesService.getStories()
        .subscribe(
        (stories: any[]) => {
          for (let i = 0; i < 20; i++) {
            let id = stories[i];
            this.storiesService.getStory(stories[i])
              .subscribe(
              (data: any) => {
                this.stories.push({ data: data, id: id });
                loading.dismiss();
                this.storiesRetreived = this.stories;
              }
              );
          }
        },
        (err: Error) => console.error(err)
        );
    });
  }

  private getComments(data: any): void {
    console.log(data);
    this.nav.push(CommentsPage, { data: data });
  }

  private open(url: string) {
    window.open(url);
  }

  doInfinite(infiniteScroll: any) {
    let newIndex = this.previousIndex - 20;
    for (let i = this.previousIndex; i > newIndex; i--) {
      let id = this.storyIDs[i];
      this.storiesService.getStory(this.storyIDs[i])
        .subscribe(
        (data: any) => {
          this.stories.push({ data: data, id: id });
        },
        (error: Error) => {
          console.log(error);
        }
        )
    }
    infiniteScroll.complete();
    this.previousIndex = newIndex;
  }

  private share(url: string) {
    SocialSharing.share('Check out this cool article!', null, null, url);
  }

  private searchItems(event: any) {
    this.stories = this.storiesRetreived;
    let searchValue = event.target.value;

    if (searchValue && searchValue.trim() !== '') {
      this.stories = this.stories.filter((item) => {
        return (item.data.title.toLowerCase().indexOf(searchValue.toLowerCase()) > -1);
      })
    }
  }

}